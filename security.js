var brain = require('brain')
, fs = require('fs')
, usage = require('usage');

var net = new brain.NeuralNetwork();

var pid = process.pid;

/*(function(){
	console.log("Reading training data file.");
	fs.readFile('kddcupTraining.data',{"encoding":"utf-8"},function(err,data){
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
			if(row[41] === undefined)
				return;
			//var isNormal = row === "normal";
			var input = {
				duration: row[0],
				protocol_type: row[1],
				service: row[2],
				flag: row[3],
				src_bytes: row[4],
				dst_bytes: row[5],
				land: row[6],
				wrong_fragment:row[7],
				urgent: row[8],
				hot: row[9],
				num_failed_logins: row[10],
				logged_in: row[11],
				num_compromised: row[12],
				root_shell: row[13],
				su_attempted: row[14],
				num_root: row[15],
				num_file_creations: row[16],
				num_shells: row[17],
				num_access_files: row[18],
				num_outbound_cmds: row[19],
				is_host_login: row[20],
				is_guest_login: row[21],
				count: row[22],
				srv_count: row[23],
				serror_rate: row[24],
				srv_serror_rate: row[25],
				rerror_rate: row[26],
				srv_rerror_rate: row[27],
				same_srv_rate: row[28],
				diff_srv_rate: row[29],
				srv_diff_host_rate: row[30],
				dst_host_count: row[31],
				dst_host_srv_count: row[32],
				dst_host_same_srv_rate: row[33],
				dst_host_diff_srv_rate: row[34],
				dst_host_same_src_port_rate: row[35],
				dst_host_srv_diff_host_rate: row[36],
				dst_host_serror_rate: row[37],
				dst_host_srv_serror_rate: row[38],
				dst_host_rerror_rate: row[39],
				dst_host_srv_rerror_rate: row[40]
			};
			var output = {};
			row[41] = row[41].split(".")[0];
			if(row[41] === "normal" || row[41] === "pod" || row[41] === "smurf" || row[41] === "land"
				|| row[41] === "back" || row[41] === "neptune" || row[41] === "teardrop"){
				output[row[41]] = 1;
				trainArr.push({input:input,output:output});
				console.log(count);
			}
			count++;
			//var is_ping_ddos = row === "pod" || row === "smurf";
			//var is_udp_ddos = row === "";
			//var is_tcp_ddos = row === "land" || row === "neptune" || row === "teardrop";
		});
		console.log("Training neural networks");
		net.train(trainArr);
	});
})();
*/
module.exports.ddosCheck = function(app){
	app.use(function(request,response,next){
		console.log("Executing middleware");
		usage.lookup(pid,{keepHistory:true} ,function(err, result) {
			if(err){
				console.log("Error is : " + err);
			}
			else{
				if(result["cpu"] > 80 || result["memory"]/(1024*1024) > 512){
					console.log("Server under load");
					return;
				}
				else{
					console.log("Normal");
					next();
				}
			}
		});
	});
}