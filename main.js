"use strict";
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
var System = {};
$(document).ready(function() {
	System = (function ($) {
		var all = $(document);
		var output = $("#output");
		var caret = $("#input .caret");
		var textentry = $("#input .text");
		var inBox = $("#inBox");

		var inputEnabled = true;
		var input = "";
		var cwd = "/";
		var builtins = [];

		function returnStr() {
			return "";
		}

		function setInput(value) {
			if (value === true || value === false) {
				inputEnabled = value;
				$("#input")[value? "show" : "hide"]();
			} else if (inputEnabled) {
				input = value || "";
				textentry.text(value);
			}
		}

		function doCommand(command) {
			var args = command.split(" ");
			var command = args.splice(0, 1);
			if (commands[command]) {
				commands[command].apply(null,args);
			} else {
				System.writeln("Unknown command: " + command);
			}
		}

		function File(contents) {
			this.contents = contents || "";
		}
		File.typeof = function(path) {
			var file = File.open(path);
			if (file instanceof File) {
				return "file";
			} else if (file instanceof Object) {
				return "folder";
			} else {
				return null;
			}
		};
		File.open = function(path) {
			var parts = System.path.split(System.path.solve(path));
			var here = filesystem;
			parts.forEach(function(part) {
				if (typeof here[part] == "function") {
					here = here[part]();
				} else if (here[part] == null) {
					here[part] = new File();
					here = here[part];
				} else {
					here = here[part];
				}
			});
			return here;
		};
		File.delete = function(path) {
			var dir = File.open(System.path.basename(path));
			return delete dir[System.path.filename(path)];
		};
		File.prototype.read = function(amount) {
			amount = amount || this.contents.length;
			return this.contents.substr(0, amount);
		};
		File.prototype.write = function(text) {
			this.contents += text;
		};

		var stdin = new File();
		stdin.read = function() {
			return input;
		};
		stdin.write = returnStr;
		var stdout = new File();
		stdout.read = returnStr;
		stdout.write = function(text) {
			System.write(text);
		};
		var random = new File();
		random.read = function() {
			return Math.random();
		};
		random.write = returnStr;
		var filesystem = {
			"dev": {
				"in": stdin,
				"out": stdout,
				"random": random
			},
			"usr": {
				"conf": {
					"pn.ini": new File("[Private]\nKey=ez2-ip-1-14-73-2.atlantisaws.com"),
					"sys.t": new File("()$*&*¨%()@$EY%()#&$Y%&@N$F)&*@#$()@#F(@)$#)*&@(#$)(&#")
				},
				"data": {
					"part1": new File("8vDDEy \"*Kv LvvÇ vHRvJnWÇO m"),
					"part2": new File("EQu MEQ*Kv bvTJPvU nPWY ITby "),
					"part3": new File("JEÇObTnQDTnWEÇY` ¨Ecy EÇ nE L"),
					"part4": new File("QYWÇvYYa MEQ cWDD ÇEn IWÇU nP"),
					"part5": new File("v UTnT mEQ ÇvvU WÇ nPWY JEZRQ"),
					"part6": new File("nvbu            );+u,.u_.+u;)")
				},
				"main.py": new File("import crypt\nimport ini\nimport multipart\n\nconfig=ini.load('conf/pn.ini')\ncrypt.caesar(config.get('Private.Key'), multipart.open('data/part*'))")
			},
			"hi": new File("hi there! <3")
		};

		var dns = {
			"ez2-ip-1-14-73-2.atlantisaws.com": "21",
			"183.45.253.81": function () {
				System.input.hide();
				System.clear();
				var lag = 900;
				var messages = ["Thank you for playing this game!",
								"Also, congratulations on decoding the file!",
								"It was developed by Leonardo G. Scur (kroltan), with",
								"creative help and sound effect(s) created by John N.",
								"Shields (gtarmetro). It was made for the Ludum Dare",
								"#30 game development competition, under the 'jam'",
								"modality. Please rate the game!",
								"","","",
								"Also, you can have fun writing Javascript programs",
								"for this pseudo-linux shell. Feel free to look at",
								"and modify the (ugly) source code! This is a tad",
								"limited, but works better than what I expected when",
								"writing its code. It's ugly and inefficient, but works.",
								"", "CONNECTION TERMINATED BY REMOTE HOST",
								"New mount location detected."];
				for (var i = 0; i < messages.length; i++) {
					(function () {
						var msg = messages[i];
						setTimeout(function() {
							System.writeln(msg);
						}, i*lag);
					})();
				};
				setTimeout(function() {
					System.input.show();
					System.mkdirs("/mnt");
				}, messages.length*lag);
				return "";
			}
		};

		var packageRepo = {
			sayHi: function () {
				System.writeln("HELLO");
			}
		};

		var System = {
			API: function(obj) {
				obj = obj || System;
				var things = [];
				for (var key in obj) {
					if (typeof obj[key] == "object") {
						var subThings = System.API(obj[key]);
						subThings.forEach(function (tng) {
							things.push(key + "." + tng);
						})
					} else {
						things.push(key);
					}
				}
				return things;
			},
			File: File,
			input: {
				hide: function() {
					setInput(false);
				},
				show: function() {
					setInput(true);
				}
			},
			web: {
				get: function (url) {
					var value = dns[url];
					if (typeof value == "function") {
						value = value();
					}
					return value;
				},
				host: function (path, fn) {
					dns[path] = fn;
				}
			},
			pack: {
				install: function (pack) {
					if (Object.keys(packageRepo).indexOf(pack) >= 0 && Object.keys(commands).indexOf(pack) < 0) {
						commands[pack] = packageRepo[pack];
						return true;
					} else {
						return false;
					}
				},
				remove: function (pack) {
					if (Object.keys(commands).indexOf(pack) >= 0 && builtins.indexOf(pack) < 0) {
						delete commands[pack];
						return true;
					} else {
						return false;
					}	
				}
			},
			path: {
				split: function(path) {
					return path.split("/").filter(function(part) {
						return part;
					});
				},
				solve: function(path) {
					if (path.indexOf("/") == 0) {
						return path;
					} else if (path.indexOf("..") == 0) {
						var cwdparts = System.path.split(cwd);
						var pathparts = System.path.split(path);
						var newparts = [];
						for (var i = pathparts.length - 1; i >= 0; i--) {
							var part = pathparts[i];
							if (part == "..") {
								cwdparts.pop();
								pathparts.splice(i, 1);
							} else {
								newparts.push(part);
							}
						};
						return "/" + cwdparts.concat(pathparts).join("/");
					} else {
						return [cwd, path].join(endsWith(cwd, "/")? "":"/");
					}
				},
				basename: function(path) {
					return path.split("/").splice(0, path.length-3).join("/");
				},
				filename: function(path) {
					return path.split("/").pop();
				}
			},
			decorateCommand: function(func, help) {
				func.help = help;
				return func;
			},
			write: function(str) {
				output.text(output.text() + str);
				all.scrollTop(all.height());
				return str;
			},
			writeln: function(str) {
				return System.write(str+"\n");
			},
			clear: function() {
				output.text("");
			},
			listfiles: function(path) {
				if (File.typeof(path) == "folder") {
					return File.open(path);
				}
			},
			runcommand: function(args) {
				doCommand(args.join(" "));
			},
			mkdirs: function(path) {
				var parts = System.path.split(System.path.solve(path));
				var current = filesystem;
				parts.forEach(function(part) {
					if (!current[part]) {
						current[part] = {};
					}
					current = current[part];
				});
			},
			playSound: function(name) {
				$("#sound-"+name)[0].play();
			},
			execfile: function (file) {
				return eval("(function(System){"+file.read()+"})(System)");
			},
			caesarCipher: function (text, key) {
				var chars = "'\"1234567890-=!@#$%¨&*()_+,.<>;:~^´`[]{}\\|qwertyuiopasdfghjklçzxcvbnmQWERTYUIOPASDFGHJKLÇZXCVBNM";
				return text.split("").map(function(char) {
					if (chars.indexOf(char) >= 0) {
						return chars[(chars.indexOf(char) + key) % chars.length];
					} else {
						return char;
					}
				}).join("");
			}
		};

		var commands = {
			ls: System.decorateCommand(function() {
				var list = System.listfiles(cwd);
				for (var key in list) {
					System.write(key);
					if (File.typeof(key) == "folder") {
						System.write("/");
					}
					System.writeln("");
				};
			}, "Lists all files in the current directory"),
			pwd: System.decorateCommand(function() {
				System.writeln(cwd);
			}, "Prints the current directory's full path"),
			cd: System.decorateCommand(function(path) {
				if (File.typeof(path) == "folder") {
					cwd = System.path.solve(path);
				} else {
					System.writeln("Not a folder!");
				}
			}, "cd <dir>\nChanges directory"),
			cat: System.decorateCommand(function() {
				for (var i = 0; i < arguments.length; i++) {
					var path = arguments[i];
					if (File.typeof(path) == "file") {
						System.writeln(File.open(path).read());
					}
				};
			}, "cat <file>\nDisplays the contents of the given file"),
			help: System.decorateCommand(function(command) {
				if (command) {
					System.writeln(commands[command].help);
				} else {
					for (var cmd in commands) {
						System.writeln(cmd);
					}
				}
			}, "help [command]\nShows help information about commands"),
			write: System.decorateCommand(function(path) {
				var content = Array.prototype.slice.call(arguments, 1, arguments.length).join(" ");
				var file = File.open(System.path.solve(path));
				file.write(content);
			}, "write <file> <contents> [...]\nAppends content to the given file"),
			mkdir: System.decorateCommand(function(path) {
				System.mkdirs(path);
			}, "mkdir <dir>\nCreates a directory"),
			rm: System.decorateCommand(function(path) {
				File.delete(path);
			}, "rm <path>\nRemoves a file or directory"),
			clear: System.decorateCommand(function() {
				System.clear();
			}, "Clears the screen"),
			pack: System.decorateCommand(function(task, pack) {
				switch (task) {
					case "install":
					case "remove":
						if (System.pack[task](pack)) {
							System.writeln("Package "+pack+" "+task+"ed with success");
						} else {
							System.writeln("Failed to "+task+" package "+pack);
						}
						break;
					case "list":
						var list = commands;
						if (pack == "remote") {
							list = packageRepo;
						} else {
							System.writeln("To see packages available to install, use `pack list remote`");
						}
						for (var cmd in list) {
							System.writeln(cmd);
						}
						break;
					case "update":
						System.writeln("Everything is up-to-date.");
						break;
					default:
						System.writeln("install, list, remove, update");
				}
			}, "pack [install|remove|list|update] [package]\nPerforms actions related to packages."),
			wget: System.decorateCommand(function(url) {
				System.writeln(System.web.get(url));
			}, "wget <url>\nPrints the contents of a webpage"),
			api: System.decorateCommand(function() {
				System.API().forEach(function (name) {
					System.writeln("System."+name);
				});
			}, "Lists the system Javascript API functions"),
			run: System.decorateCommand(function (path) {
				var file = File.open(System.path.solve(path));
				System.writeln(System.execfile(file) || "");
			}, "run <file>\nExecutes a Javascript file.")
		};
		builtins = Object.keys(commands);

		all.keydown(function (event) {
			if ((event.key == "Enter" || event.which == 13) && input.length) {
				System.writeln("$ "+input);
				doCommand(input);
				setInput("");
				inBox.val("");
			}
		});
		all.click(function(event) {
			inBox.get(0).focus();
		});
		inBox.on("input", function(event) {
			setInput(inBox.val());
		});
		return System;
	})(jQuery);
	var lag = 100;
	var mbr_iters = 64;
	var words = [
		["Accessing",	"Installing",	"Checking",		"Analyzing",		"Inspecting",	"Testing",	"Configuring",	"Repairing"],
		["hardware",	"software",		"repository",	"package",			"program",		"binary",	"driver",		"shell"],
		["environment",	"settings",		"data",			"configuration",	"integrity",	"metadata",	"permissions",	"fuselage"]
	];
	function getRandomPhrase() {
		var randWords = [];
		words.forEach(function(group) {
			var word = group[Math.floor(Math.random()*group.length)];
			randWords.push(word);
		});
		return randWords.join(" ");
	}
	System.input.hide();
	System.playSound("init");
	System.writeln("Loading MBR data...");
	for (var i = mbr_iters; i >= 0; i--) {
		var randomdiv = ((Math.random()*10+5)>>0);
		var func = i != mbr_iters? function () {
			var num = Math.floor(Math.random()*Math.abs(1<<31));
			var action = getRandomPhrase();
			var text = num%randomdiv == 0? " \tcorrupt" : "";
			System.writeln(action + " \t" + num.toString(16) + (num*2).toString(16) + text);
		} : function() {
			System.writeln("Booting system...");
		};
		setTimeout(func, i*lag);
	};
	setTimeout(function() {
		System.clear();
		System.input.show();
		System.writeln("Blue Cap Business Linux 1.7.85");
		System.writeln("Last login: "+new Date(Math.random()*Math.abs(1<<31)*2));
		System.writeln("\nUpdates available, use `pack update` to update.");
		setTimeout(function() {
			System.writeln("Incoming broadcast:");
			System.writeln("===================");
			System.writeln("TASK:              ");
			System.writeln("Locate and transfer");
			System.writeln("the file containing");
			System.writeln("information about  ");
			System.writeln("the private network\n");
		}, 500);
	}, (mbr_iters+10)*lag);
});;