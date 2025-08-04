import { OutlinedInput, InputAdornment, IconButton, useTheme } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { CSSProperties, FC } from "react";

const SearchInput: FC<{ 
    sx?: CSSProperties; placeholder?: string;
    onSearch: ( ) => void; value: string;
    onChange: ( value: string ) => void;
    disabled?: boolean; selectOnFocus?: boolean;
}> = ( { sx = { }, placeholder = "", onSearch, value, onChange, disabled, selectOnFocus = false } ) => {
    const theme = useTheme( );
    
    return (
        <OutlinedInput
            value={ value }
            type="text"
            placeholder={ placeholder }
            endAdornment={
                <InputAdornment position="end" sx={{ "button": { backgroundColor: "transparent !important", outline: "none !important" } }}><IconButton size="medium" edge="end" onClick={ ( ) => onSearch( ) }><SearchIcon /></IconButton></InputAdornment>
            }
            sx={{ borderRadius: "30px", border: `solid 1px ${ theme.palette.pureWhite }`, padding: "0 1rem", ...sx }}
            onKeyUp={k => { 
                if( k.key == "Enter" )
                    onSearch( );
            }}
            onFocus={ selectOnFocus ? e => e.target.select( ) : undefined }
            onChange={ e => onChange( e.target.value ) }
            disabled={ disabled }
        />
    );
};

export default SearchInput;
