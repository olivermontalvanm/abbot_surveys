import { PieChart } from "@mui/x-charts";
import { FC } from "react";

interface IProps {
    colors?: string[ ];
    data: { label: string; value: number; color?: string; }[ ]
};

const PieChartB: FC<IProps> = ( { colors, data } ) => {
    const defaultColors = [
        "#2980b9", "#2c3e50"
    ];

    for( let i = 0; i < data.length; i++ ) {
        if( !data[ i ].color ) {
            let colorSource;

            if( colors && colors.length > 1 ) {
                colorSource = colors;
            } else {
                colorSource = defaultColors;
            }

            data[ i ].color = colorSource[ i % 2 == 0 ? 0 : 1 ];
        }
    }
    
    return (
        <PieChart
            series={[
                { 
                    innerRadius: 40,
                    outerRadius: 100,
                    paddingAngle: 1,
                    data,
                    /*arcLabel: ( params: DefaultizedPieValueType ) => {
                        const TOTAL = 300;
                        const percent = params.value / TOTAL;
                        return `${( percent * 100 ).toFixed( 2 )}%`;
                    },*/
                    arcLabelRadius: 70,
                    cx: 100
                }
            ]}
            height={ 200 }
            width={ 400 }
            slotProps={{
                legend: { hidden: false, direction: "column", markGap: 8, labelStyle: { fontSize: 14 } },
                pieArcLabel: { style: { fontSize: 14 } }
            }}
        />
    );
};

export default PieChartB;
