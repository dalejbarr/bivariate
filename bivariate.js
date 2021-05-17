function openTab(evt, tabname) {
    var i, tabcontent, tablinks;

    // hide all elements with class="tabcontent"
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
	tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks")
    for (i = 0; i < tablinks.length; i++) {
	tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // show current, add "active" to button that opened it
    document.getElementById(tabname).style.display = "block";
    evt.currentTarget.className += " active";
}

function render_code() {
    rho_pad = d3.format(">.2f")(rho).padStart(5, ' ');
    cov_pad = d3.format(">.2f")(rho * sd_x * sd_y).padStart(5, ' ');
    sd_x_fmt = d3.format(">.2f")(sd_x);
    sd_y_fmt = d3.format(">.2f")(sd_y);
    sd_x2_fmt = d3.format(">.2f")(sd_x * sd_x);
    sd_y2_fmt = d3.format(">.2f")(sd_y * sd_y);
    cov_str = rho_pad + " * " + sd_x_fmt + " * " + sd_y_fmt;
    cov_fmt = d3.format(">.2f")(rho * sd_x * sd_y).padStart(5, ' ');
    mu_x_fmt = d3.format(">.2f")(mu_x).padStart(5, ' ');
    mu_y_fmt = d3.format(">.2f")(mu_y).padStart(5, ' ');
    obs_str = "";
    for (let i = 1; i <= 6; i++) {
	obs_str += "#  [" + i + ",] " +
	    d3.format(">.5f")(compute_x(obs[i-1])).padStart(8, ' ') + " " +
	    d3.format(">.5f")(compute_y(obs[i-1])).padStart(8, ' ') + "\n";
    }
    d3.select("#rcode")
	.text("# covariance: rho * sd_x * sd_y\n" +
	      "covar <- " + rho_pad +
	      " * " + sd_x_fmt +
	      " * " + sd_y_fmt + "\n\n" +
	      "# bind vectors into covariance matrix\n" +
	      "cov_mx <- rbind(c(" + sd_x_fmt +
	      "^2, covar),\n" +
	      "                c(covar,  " +
	      sd_y_fmt + "^2))" + "\n\n" +
	      "#       [,1]  [,2]\n" +
	      "# [1,]  " + sd_x2_fmt + " " + cov_fmt + "\n" +
	      "# [2,] " + cov_fmt + "  " + sd_y2_fmt + "\n\n" +
	      "# simulate data\n" +
	      "MASS::mvrnorm(n = 100,\n" +
	      "              mu = c(x =" + mu_x_fmt +
	      ", y =" + mu_y_fmt + "),\n" +
	      "              Sigma = cov_mx)\n\n" +
	      "#              x        y\n" +
	      obs_str
	     );
    hljs.highlightAll();
}

function compute_x(d) {
    return d.x * sd_x * sd_x + d.y * rho * sd_x * sd_y + mu_x;
}

function compute_y(d) {
    return d.x * rho * sd_x * sd_y + d.y * sd_y * sd_y + mu_y;
}

function get_poly(rad) {
    var npts = 32;
    var result = [];
    for (let i = 0; i < npts; i++) {
	result[i] = { x: rad * Math.cos((i / npts) * 2 * Math.PI),
		      y: rad * Math.sin((i / npts) * 2 * Math.PI)};
    }
    return result;
}

function new_sample() {
    var t = d3.transition()
	.duration(500);
    
    for (i = 0; i < nobs; ++i) {
	obs[i] = { x:random(), y:random() }
    }

    canvas
	.selectAll("circle")
	.data(obs)
	.enter()
	.append("circle")
	.merge(circles)
	.transition(t)
	.attr("cx", function(d) { return scale_x(compute_x(d)) })
	.attr("cy", function(d) { return scale_y(compute_y(d)) })

    render_code();
}

function reset() {
    mu_x = mu_y = rho = 0;
    sd_x = sd_y = 1;
    d3.select("#rho_value")
	.text(d3.format(">+.2f")(rho));
    d3.select("#mx_value")
	.text(d3.format(">+.2f")(mu_x));
    d3.select("#my_value")
	.text(d3.format(">+.2f")(mu_y));
    d3.select("#sx_value")
	.text(d3.format(">.2f")(sd_x));
    d3.select("#sy_value")
	.text(d3.format(">.2f")(sd_y));
    document.getElementById("slider_rho2").value = 0;
    document.getElementById("slider_sx2").value = 1;
    document.getElementById("slider_sy2").value = 1;	
    document.getElementById("slider_mx2").value = 0;
    document.getElementById("slider_my2").value = 0;	
    update_all();
}

function update_all() {
    d3.selectAll("polygon")
	.attr("points", function(d) {
	    return d.map(function(d) {
		return [scale_x(compute_x(d)),
			scale_y(compute_y(d))].join(",");
	    }).join(" ");
	});
    d3.selectAll("circle")
	.attr("cx", function(d) { return scale_x(compute_x(d)) })
	.attr("cy", function(d) { return scale_y(compute_y(d)) });
    render_code();
}

function rho_change(val) {
    rho = val;
    update_all();
    render_code();
    d3.select("#rho_value")
	.text(d3.format(">+.2f")(rho));
}

function sy_change(val) {
    sd_y = val;
    update_all()
    d3.select("#sy_value")
	.text(d3.format(">.2f")(sd_y))
}

function sx_change(val) {
    sd_x = val;
    update_all()
    d3.select("#sx_value")
	.text(d3.format(">.2f")(sd_x))
}

function my_change(val) {
    mu_y = parseFloat(val);
    update_all()
    d3.select("#my_value")
	.text(d3.format(">+.2f")(mu_y))
}

function mx_change(val) {
    mu_x = parseFloat(val);
    update_all()
    d3.select("#mx_value")
	.text(d3.format(">+.2f")(mu_x))
}

var grange = 5;

var sd_x = 1, sd_y = 1, rho = 0, mu_x = 0, mu_y = 0;

var margin = {top: 42, right: 12, bottom: 12, left: 12},
    width = 324 - margin.left - margin.right,
    height = 354 - margin.top - margin.bottom;

var obs = [];
var nobs = 100;
var random = d3.randomNormal(0, 1);
for (let i = 0; i < nobs; i++) {
    obs[i] = { x:random(), y:random() };
}

var canvas = d3.select("#dataviz_area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
// translate to leave some margin
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the x and y axes
var scale_x = d3.scaleLinear()
    .domain([-grange, grange])
    .range([0, width]);

canvas
    .append('g')
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.axisBottom(scale_x));

var scale_y = d3.scaleLinear()
    .domain([-grange, grange])
    .range([height, 0]);

canvas
    .append('g')
    .attr("transform", "translate(" + width / 2 + ",0)")
    .call(d3.axisLeft(scale_y));

var axis_labels = [
    {pt: {x:grange - .2, y:.5}, label: "x"},
    {pt: {x:.5, y:grange - .2}, label: "y"}];

axis_labels.forEach(function(d) {
    canvas
	.append("g")
	.attr("transform", "translate(" + scale_x(d.pt.x) + "," +
	      scale_y(d.pt.y) + ")")
	.append("text")
	.text(function() { return d.label; })
});

var dpts = [ ];

//           10%    20%   30%   40%   50%  
var quant = [.126, .253, .385, .524, .674,
	     //60%   70%   80%    90%    99% 
	     .842, 1.036, 1.282, 1.644, 2.576];

for (let i = 0; i < quant.length; i++) {
    dpts[i] = get_poly(quant[i]);
}

var rings = canvas
    .append('g')
    .selectAll("ellipse")
    .data(dpts)
    .enter()
    .append("polygon")
    .attr("points", function(d) { 
	return d.map(function(d) {
	    return [scale_x(compute_x(d)),scale_y(compute_y(d))].join(",");
	}).join(" ");
    })
    .attr("fill", "blue")
    .attr("fill-opacity", .05);

// observations
var circles = canvas
    .append('g')
    .selectAll("circle")
    .data(obs)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return scale_x(compute_x(d)) })
    .attr("cy", function(d) { return scale_y(compute_y(d)) })
    .attr("r", 3)
    .attr("fill", "blue")
    .attr("opacity", .5);    

document.getElementById("plotbut").className += " active";
document.getElementById("plot").style.display = "block";
reset();    
