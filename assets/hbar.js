/* Radar – QN · barre orizzontali con etichette a sinistra (titolo + riga secondaria),
   valori diretti a fine barra, linea di riferimento opzionale. Richiede radar.js. */
(function () {
  "use strict";
  var R = window.Radar;

  /**
   * Radar.hbar(host, rows, opt)
   * rows: [{ name, sub, extra, value, hi (bool, rosso), tip (html) }]
   * opt: { fmt(v, i) testo del valore, max, ref: {value, label}, aria, labW, barH }
   */
  function hbar(host, rows, opt) {
    opt = opt || {};
    var tip = R.tooltip(host);
    var clear = function () {};
    R.dismissOutside(host, function () { tip.hide(); clear(); });
    var max = opt.max || d3.max(rows, function (d) { return d.value; });

    R.responsive(host, function (W, phase) {
      var narrow = W < 520;
      var bh = opt.barH || 20;
      var LH = 17, SUBH = 16, GAP = narrow ? 22 : 12;
      var labW = narrow ? W : Math.min(opt.labW || 220, Math.round(W * 0.42));
      var x0 = narrow ? 0 : labW;
      var valSpace = opt.valSpace || 64;
      var top = opt.ref ? 26 : 2;

      d3.select(host).select("svg").remove();
      var svg = d3.select(host).insert("svg", ".r-tip").attr("width", W).attr("role", "img");
      if (opt.aria) svg.attr("aria-label", opt.aria);
      if (opt.title) svg.append("title").text(opt.title);
      var g = svg.append("g").attr("transform", "translate(0," + top + ")");

      // etichette: misuro le righe per calcolare l'altezza di ogni riga
      var y = 0, layout = [];
      var labs = g.append("g").attr("class", "hb-labels");
      rows.forEach(function (d, i) {
        var lg = labs.append("g").attr("class", "mark").datum(d);
        var t = lg.append("text").attr("class", "series-label").attr("x", 0).attr("y", 0).attr("dy", 12.5)
          .style("fill", "var(--ink)").text(d.name);
        R.wrap(t, labW - (narrow ? 0 : 14), 1.3);
        var nl = +t.attr("data-lines") || 1;
        if (d.extra) {
          // testo secondario in linea dopo il nome (sull'ultima riga)
          var last = t.selectAll("tspan").nodes().pop();
          d3.select(last).append("tspan").attr("class", "series-label--sub").style("font-weight", 400)
            .style("fill", "var(--ink-2)").text(" " + d.extra);
        }
        var h = nl * LH;
        if (d.sub) {
          var s = lg.append("text").attr("class", "series-label--sub").attr("x", 0).attr("y", h).attr("dy", 12).text(d.sub);
          R.wrap(s, labW - (narrow ? 0 : 14), 1.3);
          h += (+s.attr("data-lines") || 1) * SUBH;
        }
        var rowH, by, ly;
        if (narrow) {
          ly = y; by = y + h + 5; rowH = h + 5 + bh;
        } else {
          rowH = Math.max(h, bh);
          ly = y + (rowH - h) / 2 - 1; by = y + (rowH - bh) / 2;
          // con una sola riga di testo allineo il nome al centro della barra
          if (!d.sub && nl === 1) ly = by + bh / 2 - LH / 2 - 1;
        }
        lg.attr("transform", "translate(0," + ly + ")");
        layout.push({ d: d, i: i, y: y, by: by, h: rowH });
        y += rowH + GAP;
      });
      var totalH = y - GAP;
      svg.attr("height", top + totalH + 4);

      var bw = W - x0 - valSpace;
      var x = d3.scaleLinear().domain([0, max]).range([0, bw]);

      // linea di riferimento
      if (opt.ref) {
        var rx = Math.round(x0 + x(opt.ref.value)) + 0.5;
        var an = g.append("g").attr("class", "anno");
        // su mobile la linea passa solo all'altezza delle barre, per non tagliare le etichette
        var segs = narrow ? layout.map(function (l) { return [l.by - 4, l.by + bh + 4]; }) : [[-6, totalH + 2]];
        if (narrow) segs[0][0] = -6;
        an.selectAll("line").data(segs).join("line").attr("class", "dash").attr("x1", rx).attr("x2", rx)
          .attr("y1", function (d) { return d[0]; }).attr("y2", function (d) { return d[1]; });
        var rt = an.append("text").attr("x", rx).attr("y", -12).style("fill", "var(--ink-2)").style("font-size", "12px").text(opt.ref.label);
        var tw = rt.node().getComputedTextLength();
        if (rx + tw / 2 > W) rt.attr("text-anchor", "end").attr("x", Math.min(rx + 20, W));
        else if (rx - tw / 2 < 0) rt.attr("text-anchor", "start");
        else rt.attr("text-anchor", "middle");
        R.enter(an, phase, function (s) { s.style("opacity", 0); }, function (s) { s.style("opacity", 1); }, R.DUR * 0.6);
      }

      var bars = g.append("g").selectAll("path").data(layout).join("path").attr("class", "mark")
        .style("fill", function (l) { return l.d.hi ? "var(--red)" : "var(--grey)"; });
      R.enter(bars, phase,
        function (s) { s.attr("d", function (l) { return R.barPathH(x0, l.by, 0, bh, 2); }); },
        function (s) {
          if (phase === "play") s.attrTween("d", function (l) { return function (t) { return R.barPathH(x0, l.by, x(l.d.value) * t, bh, 2); }; });
          else s.attr("d", function (l) { return R.barPathH(x0, l.by, x(l.d.value), bh, 2); });
        });

      var vals = g.append("g").selectAll("text").data(layout).join("text").attr("class", "val-label mark")
        .attr("x", function (l) { return x0 + x(l.d.value) + 6; }).attr("y", function (l) { return l.by + bh / 2; }).attr("dy", "0.35em")
        .style("fill", function (l) { return l.d.hi ? "var(--red)" : null; });
      vals.each(function (l) {
        var i = l.i;
        R.countUp(d3.select(this), l.d.value, function (v) { return opt.fmt(v, i); }, phase);
      });

      var labNodes = labs.selectAll("g.mark");
      clear = function () { bars.classed("is-dimmed", false); vals.classed("is-dimmed", false); labNodes.classed("is-dimmed", false); };
      g.append("g").selectAll("rect").data(layout).join("rect").attr("class", "hit")
        .attr("x", 0).attr("width", W).attr("y", function (l) { return l.y - GAP / 2; }).attr("height", function (l) { return l.h + GAP; })
        .on("pointerenter pointerdown", function (ev, l) {
          bars.classed("is-dimmed", function (q) { return q !== l; });
          vals.classed("is-dimmed", function (q) { return q !== l; });
          labNodes.classed("is-dimmed", function (q) { return q !== l.d; });
          tip.show(l.d.tip, Math.min(x0 + x(l.d.value), W - 30), top + l.by);
        })
        .on("pointerleave", function (ev) { if (ev.pointerType === "mouse") { tip.hide(); clear(); } });
    });
  }

  R.hbar = hbar;
})();
