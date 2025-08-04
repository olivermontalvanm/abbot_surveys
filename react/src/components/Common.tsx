import { Box, styled } from "@mui/material";

export const Row = styled( Box )<{ alignment?: string; }>`
    display: flex;
    flex-flow: row;
    align-items: flex-start;
    justify-content: ${ cx => cx.alignment ?? "center "};
    gap: 1rem;
    flex-wrap: wrap;
`;

export const Column = styled( Box )`
	display: flex;
	flex-flow: column;
	align-items: flex-start;
	jusfify-content: center;
	gap: 1rem:
`;
