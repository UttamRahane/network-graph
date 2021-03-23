export default class NetworkGraph {

    private child: any;

    private svg: any;

    private zoomObj: any;

    private node: any;

    private link: any;

    private previousGraphPosition: [number, number] = [0, 0];

    private previousGraphZoom: number = 0;

    private menuOpen: boolean = false;

    private menuNode: string = '';

    private defaultZoomFlag: boolean = false;

    private defaultProps = {
        id: 'chart',
        width: 500,
        height: 500,
        data: [{
            nodes: [],
            links: [],
        }],
    };

    constructor(props: any){
        this.drawChart({...this.defaultProps, ...props});
    }

    cleanAndInit(nodesSize= 100, width=500, height= 500) {
        // remove existing chart from screen
        this.svg = d3.select('#chart1');
        this.svg.selectAll('*').remove();

        // create a svg to draw chart
        this.svg = d3.select('#chart1').append('svg')
            .attr('width', () => width)
            .attr('height', () => height)
            .attr('id', 'svgTest');

        this.child = this.svg.append('g')
            .attr('width', ()=> 500)
            .attr('height', () => 500)
            .attr('id', 'svgTest');

        this.child.attr('transform', `translate(${this.previousGraphPosition[0]}, ${this.previousGraphPosition[1]}) scale(${this.previousGraphZoom})`);

        this.zoomObj = d3.behavior.zoom().on('zoom', () => {
            if (this.menuOpen === true && this.menuNode !== '') {
                d3.select('.menu').remove();
                this.node.selectAll('circle').style('opacity', 1);
                this.node.selectAll('text').style('opacity', 1);
                this.menuOpen = false;
            }

            const scaleFactor = d3.event.scale;
            this.previousGraphPosition = d3.event.translate;
            this.previousGraphZoom = d3.event.scale;
            if (this.previousGraphZoom === 0.8) {
                setTimeout(() =>  {
                    this.defaultZoomFlag = false;
                }, 100);
            } else {
                setTimeout(() => {
                    this.defaultZoomFlag = true;
                }, 100);
            }

            // scale graph zoom in and out is set from here
            if (d3.event.scale !== 1) {
                if (d3.event.scale > 1) {
                    this.node.selectAll('text').style('font-size', ((12 + Math.floor(d3.event.scale * 2)) / d3.event.scale) + 'px');
                } else if (d3.event.scale > 0.5) {
                    this.node.selectAll('text').style('font-size', ((12 - Math.floor(d3.event.scale * 2)) / d3.event.scale) + 'px');
                }
            }
            if (d3.event.scale > 0.5) {
                this.child.attr('transform', `translate(${this.previousGraphPosition[0]}, ${this.previousGraphPosition[1]}) scale(${this.previousGraphZoom})`);
            } else {
                this.previousGraphZoom = 0.51;
                this.zoomObj.scale(0.51);
            }
        });

        this.svg.call(this.zoomObj).on("dblclick.zoom", null);
        let sankeyHeight = 500;
        let sankeyWidth = 500;

        if (height < nodesSize * 20) {
            sankeyHeight = nodesSize * 20;
            sankeyWidth = width * 1.2;
        }
        this.zoomObj.scale(this.previousGraphZoom);
        this.zoomObj.translate(this.previousGraphPosition);
        // if (this.updateGraphLayer) {
        //     this.zoomObj.scale(this.previousGraphZoom);
        // }

        // graph is drawn in layout
        const sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(32)
            .size([sankeyWidth, sankeyHeight]);
    }

    drawChart(props: any){

        const { data, width, height } = props;

        this.cleanAndInit(data.nodes.length, width, height);

        const force = d3.layout.force()
            .nodes(d3.values(data.nodes))
            .links(data.links)
            .size([width, height])
            .linkDistance(100)
            .charge(-500)
            .on("tick", this.tick())
            .start();

        // node drag to one position to another
        const nodeDrag = d3.behavior.drag()
            .on("dragstart", () => {
                // dragging selected node
                force.stop();
                this.svg.on(".zoom", null);
            })
            .on("drag", (d) => {
                d.px += d3.event.dx;
                d.py += d3.event.dy;
                d.x += d3.event.dx;
                d.y += d3.event.dy;
                this.tick();
            })
            .on("dragend", (d) => {
                // dragging stopped
                d.fixed = true;
                force.stop();
                this.tick();
                this.svg.call(this.zoomObj).on("dblclick.zoom", null);
            });

        this.node = this.child.selectAll(".node")
            // graph node
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            .style("cursor", "move")
            .on("mouseover", () => { /* function on mouseover */ })
            .on("mouseout", () => { /* function on mouseout */ })
            .on("contextmenu", () => {
                d3.event.preventDefault();
            }).call(nodeDrag);

        this.link = this.child.selectAll(".link")
            // graph link
            .data(force.links())
            .enter().append("line")
            .attr("class", "link")
            // this tag will remove arrows
            .attr("marker-end", "url(#endArrow)");

        

        this.node.append("circle")
            // display node circle with icon
            .attr("r", 15)
            .style("pointer-events", "visible")
            .style("stroke-width", 20)
            .style("stroke-opacity", 0)
            .style("fill", () => { return "#9c27b0"; });

        this.node.append("image")
            .attr("xlink:href", (d) => {
                return "https://idreamleaguesoccerkits.com/wp-content/uploads/2020/12/India-DLS-Logo-URL.png";
            })
            .attr("x", -8)
            .attr("y", -8)
            .attr("width", 16)
            .attr("height", 16);

        this.node.append("text")
            // add name text with node
            .attr("x", 24)
            .attr("dy", ".35em")
            .style("fill", () => { return "#9c27b0"; })
            .style("pointer-events", "none")
            .text((d) => d.name);

        // arrow at the end show from here
        this.svg.append("svg:defs").selectAll("marker")
            .data(["end", "endArrow"]) // Different link/path types can be defined here
            .enter().append("svg:marker") // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20)
            .attr("refY", 0)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .style("fill", "#3181bd")
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
        this.svg.select("#end").attr("class", "active-arrow");    
    }

    tick() {
        // link distance and position
        this.link.attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

        // node distance and position
        this.node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    }
}