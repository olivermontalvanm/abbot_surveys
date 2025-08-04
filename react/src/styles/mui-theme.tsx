import { createTheme, PaletteColor } from "@mui/material";
import React from "react";

declare module "@mui/material/styles" {
    interface Palette {
        pureWhite: string;
        white: string;
        white2: string;
        asphalt: string;
        llansaRed: string;
        grayBg: string;
        grayBg2: string;
        grayBg3: string;
        green: string;
		blue: string;
		red: string;
		violet: string;
		yellow: string;
        customBlue: PaletteColor;
        customRed: PaletteColor;
    }
    interface PaletteOptions {
        pureWhite: string;
        white: string;
        white2: string;
        asphalt: string;
        llansaRed: string;
        grayBg: string;
        grayBg2: string;
        grayBg3: string;
        green: string;
		blue: string;
		red: string;
		violet: string;
		yellow: string;
        customBlue: PaletteColor;
        customRed: PaletteColor;
    }
    interface TypographyVariants {
        link1: React.CSSProperties;
		body2: true;
		body3: true;
        header1: React.CSSProperties;
        header2: React.CSSProperties;
        header3: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        link1: React.CSSProperties;
		body2: true;
		body3: true;
        header1: React.CSSProperties;
        header2: React.CSSProperties;
        header3: React.CSSProperties;
    }
}

declare module "@mui/material/Typography" {
    interface TypographyPropsVariantOverrides {
        link1: true;
        body2: true;
        body3: true;
        header1: true;
        header2: true;
        header3: true;
    }
}

declare module "@mui/material/Paper" {
    interface PaperPropsVariantOverrides {
        rounded: true;
    }
}

const palette = {
    pureWhite: "#FFFFFF",
    white: "#F0F0F0",
    asphalt: "#2C2C2C",
    llansaRed: "#F34325",
    white2: "#EDEDED",
    grayBg: "#D9D9D9",
    grayBg2: "#908F99",
    grayBg3: "rgba(0, 0, 0, 0.08)",
    green: "#E8F5E9",
    blue: "#E3F2FD",
    red: "#FFEBEE",
    violet: "#E1BEE7",
    yellow: "#FFECB3",
    customBlue: {
        light: "#BBDEFB",   //  100 hue
        main: "#2196F3",
        dark: "#0D47A1",
        contrastText: "#FFF"
    },
    customRed: {
        light: "#FFCDD2",       //  100 hue
        main: "#F44336",        //  500 hue
        dark: "#B71C1C",  //  900 hue
        contrastText: "#FFF"
    }
};

export const theme = createTheme( {
    palette,
    components: {
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    //backgroundColor: `${ palette.asphalt } !important`,
                    textTransform: "inherit",
                    "&.Mui-disabled": {
                        backgroundColor: palette.grayBg + " !important",
                        color: palette.asphalt + " !important"
                    }
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    backgroundColor: "inherit !important"
                }
            }
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    "& .Mui-disabled": {
                        backgroundColor: palette.grayBg + " !important"
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: `${ palette.white} !important`
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    height: "40px",
                    padding: "0 0.5rem !important"
                }
            }
        },
        MuiPaper: {
            variants: [ {
                props: { variant: "rounded" },
                style: {
                    borderRadius: "30px",
                    border: "solid 1px #E4E7EF",
                    boxShadow: "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)"
                }
            } ]
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    variants: [
                        { 
                            props: { variant: "body2" },
                            style: {
                                fontSize: "12px"
                            }
                        },
                        { 
                            props: { variant: "body3" },
                            style: {
                                fontSize: "10px"
                            }
                        },
                        { 
                            props: { variant: "header1" },
                            style: {
                                fontSize: "28px"
                            }
                        },
                        { 
                            props: { variant: "header2" },
                            style: {
                                fontSize: "16px"
                            }
                        }
                    ]
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiInputBase-root.Mui-disabled": {
                        backgroundColor: palette.grayBg
                    }
                }
            }
        }
    }
} );
