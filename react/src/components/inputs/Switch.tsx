import { FC } from "react";
import { styled, Switch as MUISwitch, Stack, SwitchProps, Typography } from "@mui/material";

const IOSSwitch = styled( ( props: SwitchProps ) => (
    <MUISwitch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
) )( ( { theme } ) => ( {
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#65C466',
                opacity: 1,
                border: 0,
                ...theme.applyStyles( 'dark', {
                    backgroundColor: '#2ECA45',
                } ),
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: theme.palette.grey[100],
            ...theme.applyStyles( 'dark', {
                color: theme.palette.grey[600],
            } ),
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7,
            ...theme.applyStyles( 'dark', {
                opacity: 0.3,
            } ),
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create( [ 'background-color' ], {
            duration: 500,
        } ),
        ...theme.applyStyles( 'dark', {
            backgroundColor: '#39393D',
        } ),
    },
} ) );

const Switch: FC<{ label?: string; checked: boolean; offLabel?: string; onLabel?: string; onChange: ( newState: boolean ) => void; } > = ( {
    label, checked, offLabel, onLabel, onChange
} ) => {
    return (
        <Stack direction="column" spacing={ 1 } sx={{ alignItems: "left" }}>
            { label && <Typography variant="body1">{ label }</Typography> }
            <Stack direction="row" spacing={ 1 } sx={{ alignItems: "center" }}>
                { offLabel && <Typography>{ offLabel }</Typography> }
                <IOSSwitch checked={ checked } onChange={ ( _, i ) => onChange( i ) } />
                { onLabel && <Typography>{ onLabel }</Typography> }
            </Stack>
        </Stack>
    );
};

export default Switch;
