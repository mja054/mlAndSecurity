var brain = require('brain')
, fs = require('fs')
, usage = require('usage')
, pcap = require('pcap')
, pcap_session = pcap.createSession('en1', 'tcp port 8000');
//, tcp_tracker = new pcap.TCP_tracker();

var net = new brain.NeuralNetwork({hiddenLayers:[8,8]});

var pid = process.pid;

/*tcp_tracker.on('start', function (session) {
	console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
});

tcp_tracker.on('end', function (session) {
	console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
});
*/

var num_packets = {
	"syn":0,
	"ack":0,
	"fin":0,
	"psh":0,
	"urg":0,
	"rst":0
};

var history_packets = num_packets;

setInterval(function(){
/*	var str = num_packets["syn"] + "," + num_packets["ack"] + "," + "ddos" + "\n";
	fs.writeFile("trainingData",str,{flag:"a"},function(err){
		if(err)
			console.log(err);
		else{
			console.log(num_packets);
			for(key in num_packets)
				num_packets[key] = 0;
		}
	});
*/

	for(key in num_packets){
		history_packets[key] = num_packets[key];
		num_packets[key] = 0;
	}

},60000);

pcap_session.on('packet', function (raw_packet) {
	var packet = pcap.decode.packet(raw_packet);
	//tcp_tracker.track_packet(packet);
	var flags = packet.link.ip.tcp.flags;
	console.log(flags);
	for(var key in flags){
		if(flags[key] === 1)
			num_packets[key]++;
	}
});

/*tcp_tracker.on('http request', function(session, http){
	console.log("Success");
});
*/
var syn_max = 0;
var ack_max = 0;
(function(){
	console.log("Reading training data file.");
	fs.readFile('trainingData',{"encoding":"utf-8"},function(err,data){
		if(err){
			console.log(err);
			return;
		}
		data = data.split("\n");
		console.log("Number of lines : " + data.length);
		var trainArr = [];
		var count = 0;
		data.forEach(function(line){
			var row = line.split(",");
			var input = {
				"syn":parseInt(row[0]),
				"ack":parseInt(row[1])
			};
			if(parseInt(row[0]) > syn_max)
				syn_max = parseInt(row[0]);
			if(parseInt(row[1]) > ack_max)
				ack_max = parseInt(row[0]);
			var output = {};
			output[row[2]] = 1;
			trainArr.push({input:input,output:output});
		});
		trainArr = trainArr.slice(0,trainArr.length-1);
		trainArr.forEach(function(element){
			element["input"]["syn"] = element["input"]["syn"]/syn_max;
			element["input"]["ack"] = element["input"]["ack"]/ack_max;
		});
		trainArr.forEach(function(element){
			if(element["input"]["syn"]>syn_max || element["input"]["ack"] > ack_max)
				console.log("Error");
		});
		console.log("Training neural networks");
		console.log(trainArr);
		console.log(net.train(trainArr,{errorThresh: 0.006,log:true,logPeriod:100}));
	});
})();

module.exports.ddosCheck = function(app){
	app.use(function(request,response,next){
		console.log("Executing middleware");
		usage.lookup(pid,{keepHistory:true} ,function(err, result) {
			if(err){
				console.log("Error is : " + err);
			}
			else{
				var run = net.toFunction();
				console.log({"syn":history_packets["syn"]/syn_max,"ack":history_packets["ack"]/ack_max});
				var ann_result = run({"syn":history_packets["syn"]/syn_max,"ack":history_packets["ack"]/ack_max});
				console.log(ann_result);
				console.log(result["cpu"]);
				console.log(result["memory"]/(1024*1024));
				if(result["cpu"] > 80 || result["memory"]/(1024*1024) > 512 || ann_result["ddos"] > ann_result["normal"]){
					console.log("Server under load");
					response.json("Dropped");
				}
				else{
					console.log("Normal");
					next();
				}
			}
		});
	});
};