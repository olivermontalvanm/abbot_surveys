"use strict";

const { Router } = require("express");
const JoiBase = require( "@hapi/joi" );
const JoiDate = require( "@hapi/joi-date" );

const Survey = require( "@models/survey" );
const Question = require( "@models/question" );
const Option = require( "@models/option" );
const User = require( "@models/user" );
const Answer = require("../models/answer");
const Submission = require("../models/submission");
const jwt = require( "jsonwebtoken" );
const config = require( "@root/config" );
const { orderBy } = require("lodash");
const { QueryTypes } = require("sequelize");
const sequelize = require('@root/sequelize');

const Joi = JoiBase.extend( JoiDate );

class SurveyController {
    constructor( ) {
        this.router = new Router( );

        this.router.get( "/survey", [ this.hasToken ], this.getSurvey.bind( this ) );
        this.router.post( "/survey", [ this.hasToken ], this.postSurvey.bind( this ) );
        this.router.post( "/login", [ ], this.postLogin.bind( this ) );
        this.router.get( "/replies", [ this.hasToken ], this.getReplies.bind( this ) );
        this.router.get( "/replies-csv", [ this.hasToken ], this.getRepliesCSV.bind( this ) );
    }

    _buildCSV(data) {
        const submissions = {};
      
        // Group answers by submission ID
        for (const item of data) {
          const id = item.submissionid;
          if (!submissions[id]) {
            submissions[id] = {
              submissionid: id,
              surveytitle: item.surveytitle,
              ipaddress: item.ipaddress,
              submittedat: item.submittedat,
              username: item.username,
            };
          }
      
          // Use question label as CSV header
          submissions[id][item.questionlabel] = item.answer;
        }
      
        // Get all unique headers
        const headers = new Set([
          "submissionid",
          "surveytitle",
          "ipaddress",
          "submittedat",
          "username",
        ]);
        for (const row of Object.values(submissions)) {
          Object.keys(row).forEach(key => headers.add(key));
        }
      
        const headerArray = Array.from(headers);
      
        // Build CSV lines
        const csvRows = [headerArray.join(",")];
      
        for (const row of Object.values(submissions)) {
          const csvLine = headerArray.map(header =>
            row[header] !== undefined ? `"${String(row[header]).replace(/"/g, '""')}"` : ""
          );
          csvRows.push(csvLine.join(","));
        }
      
        return csvRows.join("\n");
    }      

    async getRepliesCSV( req, res ) {
        const joiSchema = Joi.object( {
            surveyid: Joi.number( ).required( )
        } );

        const { error, value: { surveyid } } = joiSchema.validate( req.query, { allowUnknown: false } );

        if( error ) {
            console.error( error );
            return res.status( 400 ).json( { message: "Bad Request" } );
        }
        
        let data = [ ];
        
        try {
        data = await sequelize.query( 
            `
                SELECT
                    sv.title as 'surveytitle',
                    s.id as 'submissionid',
                    s.ipaddress,
                    DATE_FORMAT(s.createdAt, '%Y-%m-%d %r') as 'submittedat',
                    u.username,
                    q.order as 'questionorder',
                    q.label as 'questionlabel',
                    a.value as 'answer'
                FROM Submission s
                INNER JOIN Answer a on s.id = a.submissionid
                INNER JOIN Question q on a.questionid = q.id
                INNER JOIN Users u on s.userid = u.id
                INNER JOIN Survey sv on s.surveyid = sv.id
                WHERE sv.id = :surveyid
            `,
            {
                replacements: { surveyid },
                type: sequelize.QueryTypes.SELECT
            }
        );

        const formattedData = this._buildCSV( data );

        res.setHeader( "Content-Type", "text-csv" );
        res.setHeader( "Content-Disposition", "attachment; filename='data.csv'");

        return res.status( 200 ).end( formattedData );
    } catch( e ) { console.debug( e ); }

        return res.status( 200 ).json( data );
    }

    async getReplies( req, res ) {
        const joiSchema = Joi.object( {
            surveyid: Joi.number( ).required( )
        } );

        const { error, value: { surveyid } } = joiSchema.validate( req.query, { allowUnknown: false } );

        if( error ) {
            console.error( error );
            return res.status( 400 ).json( { message: "Bad Request" } );
        }
        
        const submissions = ( await Submission.findAll( {
            where: { surveyid },
            include: [
                { model: Answer, include: [ { model: Question } ] },
                { model: User }, { model: Survey }
            ]
        } ) ).map( s => s.toJSON( ) );

        return res.status( 200 ).json( submissions );
    }

    async hasToken( req, res, next ) {
        const unauthorized = ( ) => res.status( 401 ).json( { error: "Unauthorized" } );
    
        try {
            if( !req.headers.authorization ) return unauthorized( );
    
            let [ , token ] = req.headers.authorization.split( "Bearer " );
            token = String( token ).trim( );
    
            if( !token ) return unauthorized( );
    
            const user = jwt.verify( String( token ).trim( ), config.jwtSecret );
    
            if( !user ) unauthorized( );
    
            req.user = user;
            
            return next( );
        } catch ( err ) {
            console.error( "isCrmAuthenticated; catch:", err );
            return unauthorized( );
        }    
    }    

    async postLogin( req, res ) {
        try {
            if( !req?.body ) return res.status( 400 ).json( { message: "Bad Request" } );
            
            const joiSchema = Joi.object( {
                username: Joi.string( ).required( ),
                password: Joi.string( ).required( )
            } );

            const { error, value: { username, password } } = joiSchema.validate( req.body, { allowUnknown: false } );

            if( error ) {
                console.error( error );
                return res.status( 400 ).json( { message: "Bad Request" } );
            }

            let userAndToken;

            userAndToken = await this._login( { username, password } );

            if( !userAndToken ) return res.status( 401 ).json( { message: "Unauthorized" } );
            
            return res.status( 200 ).json( { ...userAndToken } );
        } catch ( e ) {
            console.error( e );

            return res.status( 500 ).json( { message: "Internal server error" } );
        }
    }

    generateToken( user ) { return jwt.sign( user, config.jwtSecret, { expiresIn: "7d" } ); }

    async _login( { username, password } ) {
        let user = await User.findOne( { 
            where: { username, password },
        }, { raw: true } );

        if( user ) {
            user = user.toJSON( )

            delete user.password;
    
            const token = this.generateToken( user ); 
            
            return { ...user, token };    
        } else {
            return null;
        }
    }
    
    async getSurvey( req, res ) {
        const surveys = ( await Survey.findAll( {
            where: {},
            include: [
                { model: Question, include: [ { model: Option } ] }
            ],
            order: [ [ Question, 'order', 'ASC' ] ]
        } ) ).map( s => s.toJSON( ) );

        return res.status( 200 ).json( surveys );
    }

    async postSurvey( req, res ) {
        const joiSchema = Joi.object( {
            surveyid: Joi.number( ).required( ),
            data: Joi.object( ).required( )
        } );

        const { error, value: { surveyid, data } } = joiSchema.validate( req.body, { allowUnknown: false } );

        if( error ) {
            console.error( error );
            return res.status( 400 ).json( { message: "Bad Request" } );
        }

        const ip = req.headers[ "x-forwarded-for" ] || req.socket.remoteAddress || req.connection.remoteAddress;

        const user = ( await User.findOne( { where: { username: req.user.username } } ) ).toJSON( );
        
        const submission = ( await Submission.create( {
            ipaddress: ip,
            surveyid,
            userid: user.id
        } ) ).toJSON( );

        const countryQuestions = (
            await Question.findAll( { where: { label: "País", surveyid } } )
        ).map( cq => cq.toJSON( ) );

        if( user.country ) {
            for( const countryQuestion of countryQuestions ) {
                await Answer.create( {
                    questionid: countryQuestion.id,
                    value: user.country,
                    submissionid: submission.id
                } );
            }
        }

        for( const [ aKey, aValue ] of Object.entries( data ) ) {
            await Answer.create( {
                questionid: aKey,
                value: aValue,
                submissionid: submission.id
            } );
        }

        return res.status( 200 ).json( submission );
    }
}

module.exports = new SurveyController( );