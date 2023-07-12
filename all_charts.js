// Define a variable to store the selected state
let selected_state

// Set the initial value for the selected state
selected_state="US-TOTAL"

// Call the barchart and piechart functions with the selected state
barchart(selected_state)
piechart(selected_state)

// Update function to update the charts based on the selected state
let update = function(state){
    update_main(state);
}
// Main update function that removes existing charts and calls barchart and piechart functions
function update_main(state){
    d3.select('#canvas_barchart').select('g').remove();
    d3.select('#canvas_barchart').select('text').remove();
    d3.select('#canvas_piechart').select('svg').remove();
    d3.select('#canvas_piechart').select('text').remove();
    barchart(state)
    piechart(state)
}
// Select the canvas element and set its width and height      
let canvas = d3.select("#canvas_main")
                        .attr("width", 500)
                        .attr("height", 400)
// Select the tooltip element
let tooltip = d3.select("#tooltip_main")

// Create the color scale using Linear function
var colorScale = d3.scaleLinear()
                .domain([0,100000000,200000000,300000000,400000000,500000000])
                .range(d3.schemeBlues[5]);

// Create scale for Xaxis
var xScale = d3.scaleBand().range([0, 500]).padding(0.4),
yScale = d3.scaleLinear().range([400, 0]);

// Function to find the generation data for a given state
function state_generation_finder(state_given){
    let state = state_data.find( (item) =>{
        return item['State'] === state_given
    })
    let generation = state['GENERATION']
    return generation
}

// Mouseover function for the map
let mouseOver = function(d,i) {
                d3.select('#tooltip_main')
                    .style('left', (d3.event.pageX+10) + 'px')
                    .style('top', (d3.event.pageY+10) + 'px')
                    .select('#state').text(d.properties.name)

                d3.select('#tooltip_main')
                .style('left', (d3.event.pageX+10) + 'px')
                .style('top', (d3.event.pageY+10) + 'px')
                .select('#generation').text(state_generation_finder(d.properties.name))

                d3.select('#tooltip_main').classed('hidden', false);
                
                d3.selectAll("path")
                .transition()
                .duration(0)
                .style("opacity", .7)
                
                d3.select(this)
                .transition()
                .duration(0)
                .style("opacity", 1)
                .style("stroke", "red")
                .style("stroke-width","1")
                
            }

// Mouseleave function for the map
let mouseLeave = function(d) {

    try{
    if(d3.select(this)._groups[0][0]["__data__"]['properties']['name']!=highlighted._groups[0][0]["__data__"]['properties']['name']){
                d3.selectAll("path")
                .transition()
                .duration(0)
                .style("opacity", 1)
                
                d3.select(this)
                .transition()
                .duration(0)
                .style("stroke", "black")
                .style("stroke-width","0.2")
    }}
    catch(err){
        d3.selectAll("path")
        .transition()
        .duration(0)
        .style("opacity", 1)
        
        d3.select(this)
        .transition()
        .duration(0)
        .style("stroke", "black")
        .style("stroke-width","0.2")
    }
            

                d3.select('#tooltip_main').classed('hidden', true);
            }


var highlighted = d3.select(null);
// Define the zoom behavior
const zoom = d3.zoom()
            .scaleExtent([1,5])
            .translateExtent([[0,0],[500, 400]])
            .on("zoom", zoomed);

canvas.call(zoom); 
    
function zoomed(){
canvas.selectAll('path')
.attr("transform", d3.event.transform)  
}

// Button click event to reset zoom
const button = d3.select('button')
    button.on('click', function(){
// Reset the zoom transformation on the canvas
    canvas.transition().duration(10)
    .call(zoom.transform, d3.zoomIdentity)
})
              
// Function to draw the US map
let drawmap= () =>{
// Select all path elements and bind data
    canvas.selectAll('path')
            .data(us_states_data)
            .enter()
            .append('path')
            .attr('d',d3.geoPath().projection(projection))
            .attr('class','State')
            .attr('fill', (us_states_data_item) => {
                let name = us_states_data_item.properties['name']
                let state = state_data.find( (item) =>{
                    return item['State'] === name
                })
                let generation = state['GENERATION']
                return colorScale(generation)
            })
            .attr('state_name', (us_states_data_item) => {
                return us_states_data_item.properties['name']
            })
            .attr('generation' , (us_states_data_item) => {
                let name = us_states_data_item.properties['name']
                let state = state_data.find( (item) =>{
                    return item['State'] === name
                })
                let generation = state['GENERATION']
                return generation
            })
            .on('mouseover', mouseOver)
            .on('mouseout', mouseLeave)
            .on("click",function(d) {selected_state=d['properties']['name'];  update(selected_state);
                                        highlighted.style('stroke','black')
                                                .style('stroke-width',"0.2");
                                        
                                        highlighted = d3.select(this);
                                        highlighted.style('stroke','red')
                                                .style('stroke-width',"2.5");

                                    })
            .attr('transform','translate(-5,0)')
            .attr('stroke','black')
            .attr('stroke-width',"0.2")

}
//Set the color scheme for the US map
let hcolor=d3.schemeBlues[6][5];
let lcolor = d3.schemeBlues[6][0];
var w = 140, h = 300;
// Creating the legend for the map

		var key = d3.select("#main")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend")
            .attr('transform','translate(550,-300)');

		var legend2 = key.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");

		legend2.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", hcolor)
			.attr("stop-opacity", 1);
			
		legend2.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", lcolor)
            key.append("rect")
			.attr("width", w - 130)
			.attr("height", h-14)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(2,10)");

		var y = d3.scaleLinear()
			.range([h-15, 0])
            .domain([0, 500000000]);

		var yAxis = d3.axisRight(y);

		key.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(12,10)")
			.call(yAxis)
canvas.append("text")
            .attr("x", 100)
            .attr("y", 50)
            .attr("text-anchor", "center")
            .style("font-size", "22px")
            .style('font-weight', 'bold')
            .text("2021 Electricity Generation Map");


let us_states_data
let state_data
let projection 
// Loading the US states data
d3.json("us-states.json").then((data,error)=>{
    if(error){
        console.log(error)
    }
    else{
        projection = d3.geoAlbersUsa().fitSize([500,500],data)
        us_states_data = data.features
     

        d3.csv("state_generation.csv").then((data,error)=>{
            if(error){
            }
            else{
                state_data = data
                
                drawmap()
            }
        })
    }
})


//             BARCHART       
function barchart(selected_state){
let canvasbar =  d3.select("#canvas_barchart")
                .attr("width", 600)
                .attr("height", 550)
let marginbar = 200
let widthbar = canvasbar.attr("width")-marginbar
let heightbar = canvasbar.attr("height")-marginbar

var xScalebar = d3.scaleBand().range([0,widthbar]).padding(0.4)
var yScalebar = d3.scaleLinear().range([heightbar,0])

var g3 = canvasbar.append('g')
                .attr('transform','translate('+100+','+120+')')


// Loading the monthly generation data for the selected state
d3.csv("df_energy_month_generation.csv").then((alldata,error) => {
    if(error){
        console.log(error);
    }
    else{    
// Filter data based on selected_state for dynamic change of state
        data = alldata.filter( x => x['STATE']==selected_state)  
// Set xScalebar domain based on months in the data
        xScalebar.domain(data.map(function(d){return d.MONTH}))
// Set yScalebar domain based on maximum generation value in the data
        yScalebar.domain([0,d3.max(data,function(d){return +d.GENERATION})])

        g3.append('g').attr("transform",'translate(0,'+350+')')
                        .call(d3.axisBottom(xScalebar))
        g3.append('g').call(d3.axisLeft(yScalebar))
 // Create bar chart rectangles
        var mybarchart = g3.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr('class','bar')
            .attr("x",function(d){return xScalebar(d.MONTH)})
            .attr("y",function(d){return yScalebar(d.GENERATION)})
            .attr("width",xScalebar.bandwidth())
            .attr("height",function(d){return heightbar-yScalebar(d.GENERATION)})
            .attr("fill",d3.schemeBlues[6][4])
// Enable brushing on the chart    
        g3.call( d3.brush()                 
            .extent( [ [0,0], [widthbar,heightbar] ] ) 
            .on("start brush", updateChart) 
        )
 // Update the chart when brushing occurs
        function updateChart() {
            extent = d3.event.selection
            mybarchart.classed("selected", function(d){return isBrushed(extent, xScalebar(d.MONTH), yScalebar(d.GENERATION) ) } )
        }
// Check if a bar is brushed
        function isBrushed(brush_coords, cx, cy) {
                var x0 = brush_coords[0][0],
                    x1 = brush_coords[1][0],
                    y0 = brush_coords[0][1],
                    y1 = brush_coords[1][1];
            return x0 <= cx && cx <= x1 && y0 <= cy+300 && cy <= y1;}
}}
)
// Append title for the bar chart
canvasbar.append("text")
            .attr("x", 30)
            .attr("y", 50)
            .attr("text-anchor", "center")
            .style("font-size", "22px")
            .style('font-weight', 'bold')
            .text((item)=>{
                
                return "2021 " + selected_state + " Monthly Electricity Generation" 
            });
}



//           PIECHART        
function piechart(selected_state){
let canvaspie = d3.select("#canvas_piechart")
                        .attr("width", 900)
                        .attr("height", 400)
let tooltip4 = d3.select("#canvas_piechart")


const marginpie = {top: 30, right: 50, bottom: 70, left: 70},
    widthpie = 860 
    heightpie = 600 

const svgpie = canvaspie
            .append("svg")
                .attr("width", widthpie + marginpie.left + marginpie.right)
                .attr("height", heightpie + marginpie.top + marginpie.bottom)
            .append("g")
            .attr('transform','translate('+200+','+200+')')
//Loading the yearly energy generation data for the selected state
d3.csv("df_energy_yearly.csv").then((alldata,error)=>{
        const inner_radius = 0;
        const outer_radius = 100;
        const dot_radius = 7
        const color = d3.scaleOrdinal(d3.schemeSet3)
     

// Filter data based on selected_state
        data = alldata.filter( x => x['STATE']==selected_state)
// Create a pie layout with value function and sorting
        const pie = d3.pie()
            .value(function (d) {
                return d.GENERATION;
            })
            .sort(function (a, b) {
                return a["TYPE OF PRODUCER"] - b["TYPE OF PRODUCER"];
            });

        const chartData = pie(data);

// Function to create arcs for the pie chart
        const arc = d3.arc()
            .innerRadius(inner_radius)
            .outerRadius(outer_radius);
// Calculate the total electricity generation for the state
        const final_sum = d3.sum(data, function (d) { return d.GENERATION; })

        const decimal = d3.format(",.2f")
 // Append path elements for each pie slice
        svgpie
            .selectAll('path')
            .data(chartData)
            .enter()
            .append('path')
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr('d', arc)
            
 // Extract producer types and generations for the legend
        const producers = data.map((d) => {
            return d["TYPE OF PRODUCER"]
        })

        const generations = data.map((d) => {
            return d.GENERATION
        })

        // circle for legend
        svgpie.append('g')
            .selectAll("circle")
            .data(producers)
            .enter()
            .append("circle")
            .attr("cx", 5)
            .attr("cy", function (d, i) { return i * 25 })
            .attr("r", dot_radius)
            .style("fill", function (d, i) { return color(i) })
            .attr("transform", "translate(200,-50)")

        svgpie.append('g')
            .selectAll("text")
            .data(producers)
            .enter()
            .append("text")
            .attr("x", 200)
            .attr("y", function (d, i) { return (i) * 27 })
            .text(function (d, i) { return (d + " ( " + decimal((parseInt(generations[i]) / parseInt(final_sum)) * 100) + "% )") })
            .attr("transform", "translate(20,-50)")
            .style('font-size', '15')
            .style('font-weight', 'bold')
    })
canvaspie.append("text")
    .attr("x", 30)
    .attr("y", 50)
    .attr("text-anchor", "center")
    .style("font-size", "22px")
    .style('font-weight', 'bold')
    .text((item)=>{
        
        return "2021 " + selected_state + " Electricity Generation by Different Producer" 
    });
}
