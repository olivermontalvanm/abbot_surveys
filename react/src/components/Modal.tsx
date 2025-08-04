import { CSSProperties, FC } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button, SxProps, ButtonPropsVariantOverrides, Stack, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

const Modal: FC<{ 
    openModal: boolean; closeModal: ( ) => void;
    title: string; children: React.ReactNode;
	actions?: {
		label: string; callback: ( ) => void; disabled?: boolean; sx?: SxProps; variant?:  "outlined" | "contaned" | "text";
	}[ ];
	fullWidth?: boolean; maxWidth?: "sm" | "md" | "lg";
	sx?: CSSProperties; fullScreen?: boolean;
    closeButton?: boolean;
}> = ( { openModal, closeModal, title, children, actions, fullWidth, maxWidth = "md", fullScreen, closeButton } ) => {

    if( !actions ) {
        actions = [ ];
        actions[ 0 ] = { label: "Cerrar", callback: ( ) => closeModal( ) }
    }
	
    return (
        <Dialog
            open={ openModal }
            onClose={ ( ) => closeModal( ) }
            maxWidth={ maxWidth }
            fullWidth={ fullWidth }
            fullScreen={ fullScreen }
        >
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="header1">{ title }</Typography>
                    {
                        closeButton && (
                            <IconButton onClick={ closeModal }><Close /></IconButton>
                        )
                    }
                </Stack>
                <hr />
            </DialogTitle>
            <DialogContent>{ children }</DialogContent>
            <DialogActions>
                {
                    actions.map( ( act, ix ) => (
                        <Button 
                            key={ ix }
                            disabled={ act.disabled } 
                            onClick={ ( ) => act.callback ? act.callback( ) : console.warn( "No callback defined" ) }
                            sx={ act.sx }
                            variant={ act.variant as keyof ButtonPropsVariantOverrides ?? "contained" }
                        >
                            { act.label }
                        </Button>
                    ) )
                }
            </DialogActions>
        </Dialog>
    );
};

export default Modal;
