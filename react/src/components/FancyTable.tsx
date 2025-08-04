import { FC, Fragment, useState } from "react";
import { Row, Column } from "./Common";
import SearchInput from "./inputs/SearchInput";
import { Typography, Button, Divider, TableContainer, Table, TableRow, TableCell, TableBody, Skeleton, Box, Stack } from "@mui/material";
import { CatalogOption } from "../interfaces/Common";
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from "@mui/icons-material";
import Select from "./inputs/Select";
import EmptyImage from "../assets/empty-image.png";

const FancyRow: FC<{ 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row: any; columns: { label: string; format: ( row: any, ix: number ) => React.ReactNode; }[ ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template?: string; handleRowClick?: ( row: any, ix: number ) => void; ix: number;
    highlightedRow: { ix: number; state: boolean; } | null;
    highlightClickedRow: boolean;
}> = ( { row, columns, template, handleRowClick, highlightedRow, highlightClickedRow, ix } ) => {    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clickHandler = ( row: any ) => {
        if( handleRowClick ) 
            handleRowClick( row, ix );
    };
    
    return (
        <TableRow 
            sx={{ 
                display: "grid", 
                gridTemplateColumns: template ?? `repeat( ${ columns.length }, 1fr )`, 
                alignItems: "center", 
                cursor: handleRowClick ? "pointer" : "default", borderBottom: "solid 1px #E4E7EF",
                backgroundColor: highlightedRow?.ix == ix && highlightClickedRow ? "#E4E7EF" : "inherit"
            }}
            className="item-summary" 
            onClick={( ) => handleRowClick ? clickHandler( row ) : null }
        >
            {
                columns.map( ( c, i ) => {
                    return (
                        <TableCell key={ i } sx={{ borderBottom: "none" }}>{ c.format( row, ix ) }</TableCell>
                    );
                } )
            }
        </TableRow>
    );
};

interface IProps<T> {
    title: string;
    subtitle?: string;
    createAction?: { label: string; callback: ( ) => void; };
    searchAction?: { placeholder: string; onSearch: ( v: string ) => void; };
    data: T[ ]; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: { label: string; format: ( row: any, ix: number ) => React.ReactNode; }[ ];
    infiniteScroll?: boolean;
    template?: string;
    handleRowClick?: ( row: T, ix: number ) => void;
    loading?: boolean;
    filters?: { allLabel: string; options: CatalogOption[ ], selected: CatalogOption | null, onChange: ( value: CatalogOption ) => void; preventOptionsLimit?: boolean; }[ ];
    total?: number; pages?: number; currentPage?: number;
    onNextPage?: ( ) => void; onPreviousPage?: ( ) => void;
    highlightClickedRow?: boolean; highlightedRow?: { ix: number; state: boolean; } | null;
    onFirstPage?: ( ) => void; onLastPage?: ( ) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FancyTable: FC<IProps<any>> = <T, >( { 
    title, subtitle, createAction, columns, data, 
    searchAction, template, handleRowClick, loading, filters = [ ],
    total = 0, pages = 1, currentPage = 1, onNextPage, onPreviousPage,
    highlightClickedRow = true, highlightedRow = null,
    onFirstPage, onLastPage
}: IProps<T> ) => {
    const [ searchValue, setSearchValue ] = useState<string>( "" );

    return (
        <>
            <Row alignment="space-between" sx={{ alignItems: "center" }}>
                <Column>
                    <Typography variant="header2">{ title }</Typography>
                    <Typography variant="header3">{ subtitle}</Typography>
                </Column>
                <Column>
                    { createAction && <Button disabled={ loading } variant="contained" onClick={ ( ) => createAction.callback( ) }>{ createAction.label }</Button>}
                </Column>
            </Row>
            { ( filters.length > 0 || searchAction ) && ( <>
                <Divider sx={{ margin: "1rem 0" }} />
                <Stack direction="row" justifyContent="flex-start" gap="1rem">
                    { searchAction && <SearchInput selectOnFocus disabled={ loading } placeholder={ searchAction?.placeholder } value={ searchValue } onSearch={ ( ) => searchAction?.onSearch( searchValue ) } onChange={ setSearchValue } /> }
                </Stack>
                <Stack direction="row" gap="1rem" marginTop={ searchAction ? "1rem" : "0" } display="grid" gridTemplateColumns="repeat(4, 1fr)">
                    {
                        filters.map( ( f, i ) => (
                            <Select 
                                key={ i } label="" 
                                options={ f.options } 
                                value={ f.selected } 
                                handleChange={e => f.onChange( e as CatalogOption ) } 
                                sx={{ marginTop: "0", ".MuiOutlinedInput-root": { borderRadius: "25px !important" }, width: "250px" }} 
                                noSelectionText={f.allLabel}
                                disabled={ loading }
                                highlightUnknown={ false }
                                preventOptionsLimit={ f.preventOptionsLimit }
                            />
                        ) )
                    }
                </Stack>
                <Row alignment="start">
                </Row>
                <Divider sx={{ margin: "1rem 0 0 0" }} />
            </> ) }
            <Row>
                <TableContainer>
                    {   total > 0 && pages > 1 && <>
                        <Box sx={{ display: "flex", flexFlow: "row", justifyContent: "flex-end", alignItems: "center", marginTop: "1rem" }}>
                            <Box sx={{ display: "flex", gap: "1rem", textAlign: "center", boxSizing: "border-box" }}>
                                <Stack direction="row">
                                    <Box onClick={( ) => onFirstPage ? onFirstPage( ) : null} sx={{ cursor: "pointer", color: currentPage > 1 ? "inherit" : "transparent" }}><Typography><FirstPage /></Typography></Box>
                                    <Box onClick={( ) => onPreviousPage ? onPreviousPage( ) : null} sx={{ cursor: "pointer", color: currentPage > 1 ? "inherit" : "transparent" }}><Typography><ChevronLeft /></Typography></Box>
                                </Stack>
                                <Typography>Página { currentPage } de { pages }</Typography>
                                <Stack direction="row">
                                    <Box onClick={( ) => onNextPage ? onNextPage( ) : null} sx={{ cursor: "pointer",  color: currentPage < pages ? "inherit" : "transparent" }}><Typography><ChevronRight /></Typography></Box>
                                    <Box onClick={( ) => onLastPage ? onLastPage( ) : null} sx={{ cursor: "pointer",  color: currentPage < pages ? "inherit" : "transparent" }}><Typography><LastPage /></Typography></Box>
                                </Stack>
                            </Box>
                        </Box>
                        <Divider orientation="horizontal" />
                    </>
                    }
                    <Table sx={{ tableLayout: "fixed" }}>
                        <TableBody>
                            <TableRow sx={{ display: "grid", gridTemplateColumns: template ?? `repeat( ${ columns.length }, 1fr )`, alignItems: "center", borderBottom: "solid 1px #E4E7EF", boxSizing: "border-box" }}>
                                {
                                    columns.map( ( c, i ) => ( <TableCell key={ i } sx={{ borderBottom: "none", fontWeight: "500" }}>{ c.label }</TableCell> ) )
                                }
                            </TableRow>
                            { !loading && data.map( ( d, i ) => (
                                <FancyRow 
                                    key={ i }
                                    row={ d } 
                                    columns={ columns }
                                    template={ template }
                                    handleRowClick={ handleRowClick }
                                    highlightedRow={ highlightedRow }
                                    highlightClickedRow={ highlightClickedRow }
                                    ix={ i }
                                />
                            ) ) }
                            {
                                !loading && data.length == 0 && (
                                    <TableRow><TableCell sx={{ textAlign: "center" }}>
                                        <img src={ EmptyImage } width={150} />
                                        <Typography component={"div"}>No hay datos</Typography>
                                    </TableCell></TableRow>
                                )
                            }
                            {
                                loading && Array.from( Array( 5 ).keys( ) ).map( i => <Fragment key={ i }>
                                    <TableRow><TableCell><Skeleton variant="rectangular" width={"100%"} height={"30px"} sx={{ marginTop: "1rem" }} /></TableCell></TableRow>
                                </Fragment> )
                            }
                        </TableBody>
                    </Table>
                    {   total > 0 && <>
                        <Box sx={{ display: "flex", flexFlow: "row", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                            <Typography><b>Total: </b> { total }</Typography>
                            <Box sx={{ display: "flex", gap: "1rem", textAlign: "center", boxSizing: "border-box" }}>
                                <Stack direction="row">
                                    <Box onClick={( ) => onFirstPage ? onFirstPage( ) : null} sx={{ cursor: "pointer", color: currentPage > 1 ? "inherit" : "transparent" }}><Typography><FirstPage /></Typography></Box>
                                    <Box onClick={( ) => onPreviousPage ? onPreviousPage( ) : null} sx={{ cursor: "pointer", color: currentPage > 1 ? "inherit" : "transparent" }}><Typography><ChevronLeft /></Typography></Box>
                                </Stack>
                                <Typography>Página { currentPage } de { pages }</Typography>
                                <Stack direction="row">
                                    <Box onClick={( ) => onNextPage ? onNextPage( ) : null} sx={{ cursor: "pointer",  color: currentPage < pages ? "inherit" : "transparent" }}><Typography><ChevronRight /></Typography></Box>
                                    <Box onClick={( ) => onLastPage ? onLastPage( ) : null} sx={{ cursor: "pointer",  color: currentPage < pages ? "inherit" : "transparent" }}><Typography><LastPage /></Typography></Box>
                                </Stack>
                            </Box>
                        </Box>
                    </>
                    }
                </TableContainer>
            </Row>
        </>
    );
};

export default FancyTable;
