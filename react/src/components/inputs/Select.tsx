import { FC, useCallback, useMemo, memo } from "react";
import { Autocomplete as MUIAutocomplete, TextField, styled, FormControl, useTheme, SxProps, Chip, createFilterOptions, FilterOptionsState, Typography } from "@mui/material";
import { CatalogOption } from "../../interfaces/Common";

const Autocomplete = styled( MUIAutocomplete )`
    input {
        width: 100% !important;
        height: 22px;
    }
    
    .MuiButtonBase-root {
        background-color: transparent !important;
    }

    background-color: ${ ( { theme: { palette } } ) => palette.white };
`;

interface IProps {
	label?: string;
	options: CatalogOption[ ];
	value: CatalogOption | CatalogOption[ ] | null;
	handleChange: ( value: CatalogOption | CatalogOption[ ] | null ) => void;
	noOptionsText?: string;
	noSelectionText?: string;
	multiple?: boolean;
	disabled?: boolean;
	allowUnknown?: boolean;
	sx?: SxProps;
	disableClearable?: boolean;
	highlightUnknown?: boolean;
	preventFocusSelection?: boolean;
	preventOptionsLimit?: boolean;
    disableCloseOnSelect?: boolean;
}

const Select: FC<IProps> = ( { 
    label, options, value, handleChange, 
    noOptionsText = "No hay valores", 
    noSelectionText = "-- Seleccionar --", 
    multiple = false, disabled = false, allowUnknown = false, sx = {},
    disableClearable = false, highlightUnknown = false,
    preventFocusSelection, preventOptionsLimit, disableCloseOnSelect
} ) => {
    const theme = useTheme( );

    const OPTIONS_LIMIT = 25;
    const defaultFilterOption = createFilterOptions( );

    const filterOptions = useMemo( ( ) => {
        return ( options: unknown[ ], state: FilterOptionsState<unknown> ) => {
            return defaultFilterOption( options, state ).slice( 0, OPTIONS_LIMIT );
        }
    }, [ ] );

	
    const removeDuplicates: ( values: CatalogOption[ ] ) => CatalogOption[ ] = useMemo( ( ) => {
        return ( values ) => {
            const allValues = Object.assign( [ ], values ) as CatalogOption[ ];
            const uniqueValues = [ ] as CatalogOption[ ];

            for( const value of allValues ) {
                if( !uniqueValues.map( u => u.label ).includes( value.label ) )
                    uniqueValues.push( value );
            }

            return uniqueValues;
        } }, [ ] );

    const getInputBackgroundColor: ( ) => string = ( ) => {
        const backgroundColor = theme.palette.pureWhite;

        if( !Array.isArray( value ) && value ) {
            if( !value?.id && highlightUnknown )
                return "#E8F5E9";
        }

        return backgroundColor;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAutocompleteChange = useCallback( ( _: any, v: any ) => { 
        if ( Array.isArray( v ) ) {
            const newValues = removeDuplicates(
                v.map( val => typeof val === "string" ? { id: null, label: val.trim() } : val )
            );
            handleChange( newValues );
        } else {
            if ( typeof v === "string" ) {
                const trimmedV = v.trim();
                const matchingOption = options.find( o => o.label === trimmedV );
                handleChange( matchingOption ?? { id: null, label: v.trim() } );
            }
            if ( typeof v === "object" && v?.label ) {
                handleChange( { ...v, label: v.label.trim() } );
            }
        }
	
        if ( v === null && !disableClearable ) {
            handleChange( { id: null, label: noSelectionText } );
        }
    }, [ handleChange, options, removeDuplicates, disableClearable, noSelectionText ] );

    return (
        <FormControl>
            { label && <Typography variant="body2">{ label }</Typography> }
            <Autocomplete 
                filterOptions={ preventOptionsLimit ? ( ) => options : filterOptions }
                value={ value ?? ( multiple ? [ ] : { id: null, label: noSelectionText } ) } 
                options={ options } 
                getOptionLabel={ v => { 
                    if( typeof v === "string" )
                        return v;

                    if( typeof v === "object" && v && "label" in v )
                        return ( v as CatalogOption ).label;

                    return "";
                } } 
                onChange={ handleAutocompleteChange }
                renderInput={ params => ( 
                    <TextField 
                        { ...params } 
                        variant="outlined" 
                        onFocus={ e => { 
                            if( preventFocusSelection )
                                return;
						
                            e.target.select( );
                        } }
                    /> 
                ) } 
                noOptionsText={ noOptionsText }
                sx={ { 
                    marginTop: "0.5rem", backgroundColor: getInputBackgroundColor( ), ...sx
                } }
                multiple={ multiple }
                disabled={ disabled }
                freeSolo={ allowUnknown }
                autoSelect={ allowUnknown }
                disableClearable={ disableClearable }
                renderTags={ ( values ) => { return values.map( ( v, ix ) => (
                    <Chip 
                        key={ ix }
                        label={ ( v as never )[ "label" ] } 
                        onDelete={ ( ) => {
                            const allValues = Object.assign( [ ], values ) as CatalogOption[ ];
                            const filteredValues = allValues.filter( va => ( va as CatalogOption ).label != ( v as CatalogOption ).label );

                            if( handleChange )
                                handleChange( filteredValues );
                        } } 
                        variant="outlined"
                        sx={{ 
                            margin: "0.25rem",
                            "&&&": { backgroundColor: !( v as CatalogOption )?.id ? "#E8F5E9 !important" : "inherit" }
                        }}
                    />
                ) ) } }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                groupBy={ ( option: any ) => option.group }
                disableCloseOnSelect={ disableCloseOnSelect }
            />
        </FormControl>
    );
};

export default memo( Select );
