import { CSSProperties, FC } from "react";
import { FormControl, TextField, Typography, useTheme } from "@mui/material";

interface IProps {
	label: string;
	id?: string;
	value: string;
	handleChange: ( value: string ) => void;
	sx?: CSSProperties;
	placeholder?: string;
	disabled?: boolean;
	disableSelectOnFocus?: boolean;
	onKeyUp?: ( event: React.KeyboardEvent<HTMLInputElement> ) => void;
    error?: boolean;
    helperText?: string;
    onBlur?: ( event: React.FocusEvent<HTMLInputElement> ) => void;
}

const TextInput: FC<IProps> = ( { label, id, value, handleChange, sx, placeholder, disabled, disableSelectOnFocus, onKeyUp, error, helperText, onBlur } ) => {
    const theme = useTheme( );
	
    return (
        <FormControl>
            <Typography variant="body1">{ label }</Typography>
            <TextField 
                id={ id }
                value={ value }
                sx={{ 
                    marginTop: "0.5rem", backgroundColor: theme.palette.pureWhite, 
                    width: "250px", ...sx, "& .MuiFormHelperText-root": {
                        marginLeft: 0,
                        marginRight: 0
                    } 
                }} 
                onChange={ e => handleChange( e.target.value ) }
                placeholder={ placeholder }
                disabled={ disabled }
                onFocus={ ev => { 
                    if( disableSelectOnFocus )
                        return;
					
                    ev.target.select( ); }
                }
                onKeyUp={ onKeyUp }
                error={ error }
                helperText={ helperText }
                onBlur={ onBlur }
            />
        </FormControl>
    );
};

export default TextInput;
