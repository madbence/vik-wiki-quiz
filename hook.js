document.getElementById('quiz').appendChild(function() {
	var e = document.createElement('div');
	e.id = 'quiz-content';
	e.innerHTML = '<script type="text/html" id="quiz-template-normal">\
	<div class="normal">\
		<p data-bind="text: title"></p>\
		<ol style="list-style-type: upper-latin" data-bind="foreach: answers">\
			<li data-bind="click: $root.vote">\
				<input type="radio" data-bind="attr:{id:id}"/>\
				<label data-bind="text: content, attr:{for:id}"></label>\
			</li>\
		</ol>\
	</div>\
</script>\
<script type="text/html" id="quiz-template-decide">\
	<div class="normal">\
		<p data-bind="text: title"></p>\
		<ul>\
			<li data-bind="click: voteTrue">\
				<input type="radio" id="answer-true"/>\
				<label for="answer-true">Igaz</label>\
			</li>\
			<li data-bind="click: voteFalse">\
				<input type="radio" id="answer-false"/>\
				<label for="answer-false">Hamis</label>\
			</li>\
		</ul>\
	</div>\
</script>\
<script type="text/html" id="quiz-template-multiple">\
	<div class="normal">\
		<p data-bind="text: title"></p>\
		<ol style="list-style-type: upper-latin" data-bind="foreach: answers">\
			<li>\
				<input type="checkbox" data-bind="checked: selected, attr:{id:id}" />\
				<label data-bind="text: content, attr:{for:id}"></label>\
			</li>\
		</ol>\
		<input type="button" data-bind="click: $root.vote" value="Oké" />\
	</div>\
</script><div>\
	<div>Statisztika: <span data-bind="text:done"></span>/<span data-bind="text:all"></span> (<span data-bind="text:prog"></span>%), \
	<span data-bind="text:good" style="color: green"></span>/<span data-bind="text:bad" style="color: red"></span>\
	<div id="question-container" style="height: 180px; width: 300px;">\
		<div id="current-question" data-bind="template: {name: getType, data: quiz}"></div>\
	</div>\
</div>';
	return e;
}());
var e = document.createElement('script');

function map(a, f) {
	var res = [];
	for(var i in a) {
		res[i] = f(a[i], i, a);
	}
	return res;
}

function filter(a, f) {
	var res = [];
	for(var i in a) {
		if(f(a[i], i, a)) {
			res.push(a[i]);
		}
	}
	return res;
}

function shuffle(a) {
	for(var i in a) {
		var t = a[i],
			tt = Math.floor(Math.random() * a.length);
		a[i] = a[tt];
		a[tt] = t;
	}
	return a;
}
e.addEventListener('load', function() {
	var Quiz = {
		init: function(title, items) {
			Quiz.items = items;
			shuffle(items);
			var i = 0;

			function next() {
				var it = items[i++];
				if(!it) return null;
				return {
					normal: {
						title: it.title,
						answers: shuffle(map(it.answers, function(a, i) {
							return {
								index: parseInt(i),
								content: a,
								id: 'answer-' + i
							}
						})),
						solution: it.solution,
						type: it.type
					},
					multiple: {
						title: it.title,
						answers: shuffle(map(it.answers, function(a, i) {
							return {
								index: parseInt(i),
								content: a,
								selected: false,
								id: 'answer-' + i
							}
						})),
						solution: it.solution,
						type: it.type
					},
					decide: {
						title: it.title,
						solution: {
							'true': true,
							'I': true,
							'i': true,
							'Igaz': true,
							'igaz': true,
							'false': false,
							'H': false,
							'h': false,
							'Hamis': false,
							'hamis': false
						}[it.solution],
						type: it.type,
						voteTrue: function() {
							model.vote(true);
						},
						voteFalse: function() {
							model.vote(false);
						}
					}
				}[it.type];
			}

			function Model() {
				var self = this;
				self.quiz = ko.observable(next());
				self.all = items.length, self.done = ko.observable(0), self.good = ko.observable(0), self.bad = ko.observable(0), self.prog = ko.computed(function() {
					return(100 * self.done() / self.all).toFixed(2);
				});
				self.getType = function() {
					return 'quiz-template-' + self.quiz().type
				};
				self.vote = function(choice) {
					self.done(self.done() + 1);
					console.log(self.quiz().answers);
					if({
						normal: function() {
							return self.quiz().solution === choice.index;
						},
						decide: function() {
							return self.quiz().solution === choice;
						},
						match: function() {
							return self.quiz().solution === choice.value;
						},
						multiple: function() {
							var ans = map(filter(self.quiz().answers, function(i) {
								return i.selected == true;
							}), function(i) {
								return i.index;
							}).sort();
							var sol = self.quiz().solution.slice(0).sort();
							console.log(ans, sol);
							if(ans.length !== sol.length) return false;
							for(var i in ans) {
								if(ans[i] !== sol[i]) return false;
							}
							return true;
						}
					}[self.quiz().type]()) {
						self.good(self.good() + 1);
						$('#current-question').css('backgroundColor', 'rgba(0,255,0,0.3)');
					} else {
						self.bad(self.bad() + 1);
						$('#current-question').css('backgroundColor', 'rgba(255,0,0,0.3)');
					}
					$('#current-question').slideUp(1000, function() {
						self.quiz(next());
						$('#current-question').css('backgroundColor', 'transparent');
						$('#current-question').slideDown(1000);
					})

				}
			}
			var model = new Model();
			ko.applyBindings(model);
		}
	}

	Quiz.init('cim', [{
		type: 'normal',
		title: 'Sima kérdés',
		answers: ['foo', 'bar(ez a jó)', 'baz', 'woof'],
		solution: 1
	}, {
		type: 'normal',
		title: 'Sima kérdés2',
		answers: ['O hai!', 'Fasza', 'Akkor ugrok egy seggest', 'placcs!(ez a jó)'],
		solution: 3
	}, {
		type: 'decide',
		title: 'Sajtból van a hold? (nem)',
		solution: false
	}, {
		type: 'multiple',
		title: 'Kaumbó kérdés!',
		answers: ['O hai!', 'Fasza(!)', 'Akkor ugrok egy seggest(!)', 'placcs :('],
		solution: [1, 2]
	}]);
})
e.src = 'http://knockoutjs.com/downloads/knockout-2.2.1.js';
document.head.appendChild(e);

function parse(str) {
	var m;
	console.log(str);
	var regexpG = /\{\{Kvíz:(\w+)(\|(.*?))*\}\}(\r|\n)/g;
	var regexp = /Kvíz:(\w+)(\|?([^\}]*?))*/;
	var regexp2 = /\|(.*?)(=[^\|]*)?/g;
	while(m = regexpG.exec(str)) {
		console.log(m[0].match(regexp)[0].split('|'));
	}
}
parse(document.getElementById('questions').innerHTML);