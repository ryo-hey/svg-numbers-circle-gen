function hsl2htmlColor(h, s, l){
    var max,min;
    var r=0, g=0, b=0;
    // console.log(h + ","+s+","+l);
    h = parseFloat(h);
    s = parseFloat(s);
    l = parseFloat(l);

    if(h >= 360){
        var h_d = h - Math.floor(h);
        var h_i = Math.floor(h) % 360;
        h = h_i + h_d;
    }

    if(l <= 49){
        max = 2.55 * (l + l * (s / 100.0));
        min = 2.55 * (l - l * (s / 100.0));
    }else{
        max = 2.55 * (l + (100 - l) * (s / 100.0));
        min = 2.55 * (l - (100 - l) * (s / 100.0));
    }

    if(h < 60){
        r = max;
        g = min + (max - min) * (h / 60);
        b = min;
    }else if(h >= 60 && h < 120){
        g = max;
        r = min + (max - min) * ((120 - h) / 60);
        b = min;
    }else if(h >= 120 && h < 180){
        g = max;
        b = min + (max - min) * ((h - 120) / 60);
        r = min;
    }else if(h >= 180 && h < 240){
        b = max;
        g = min + (max - min) * ((240 - h) / 60);
        r = min;
    }else if(h >= 240 && h < 300){
        b = max;
        r = min + (max - min) * ((h - 240) / 60);
        g = min;
    }else if(h >= 300 && h < 360){
        r = max;
        b = min + (max - min) * ((360 - h) / 60);
        g = min;
    }
    // console.log(r);
    // console.log(g);
    // console.log(b);
    r = Math.round(r).toString(16);
    if(r.length == 1) r = "0" + r;
    g = Math.round(g).toString(16);
    if(g.length == 1) g = "0" + g;
    b = Math.round(b).toString(16);
    if(b.length == 1) b = "0" + b;
    // console.log("#"+r+g+b);
    return "#" + r + g + b;
}

function dataURL2Blob (dataurl, type){
    var binarr, bin, i, len;
    bin = atob(dataurl.split("base64,")[1]);
    len = bin.length;
    binarr = new Uint8Array(len);
    i = 0;
    while(i < len){
        binarr[i] = bin.charCodeAt(i);
        i++;
    }
    return new Blob([binarr], {
        type: type
    });
}

function processSVG(){
    var elm_H = document.getElementById("color-h");
    var elm_S = document.getElementById("color-s");
    var elm_L = document.getElementById("color-l");
    var elm_size = document.getElementById("img-size");
    var elm_start = document.getElementById("num-start");
    var elm_end = document.getElementById("num-end");
    var elm_cc = document.getElementById("color-change");
    var elm_num_border = document.getElementById("svg-num-border");
    var elm_num = document.getElementById("svg-num");
    var elm_circle = document.getElementById("svg-circle");
    var elm_svg = document.getElementById("svg-preview");
    var canvas = document.createElement("canvas");
    elm_svg.setAttribute("width", elm_size.value + "px");
    elm_svg.setAttribute("height", elm_size.value + "px");
    elm_circle.setAttribute("fill", hsl2htmlColor(elm_H.value, elm_S.value, elm_L.value));
    elm_num_border.innerHTML = elm_start.value;
    elm_num.innerHTML = elm_start.value;

    canvas.width = elm_svg.width.baseVal.value;
    canvas.height = elm_svg.height.baseVal.value;
    var ary_num = [];
    var svg_num = parseInt(elm_end.value)-parseInt(elm_start.value) + 1;
    for(var i=0; i<svg_num; i++){
        ary_num[i] = parseInt(elm_start.value) + i;
    }

    var zip = new JSZip();
    var ary_now_idx = 0;
    var now_h = parseFloat(elm_H.value);
    var h_add = 360.0 / svg_num;
    var ctx = canvas.getContext("2d");

    ary_num.forEach(function(num, idx, arr) {
        elm_circle.setAttribute("fill", hsl2htmlColor(now_h, elm_S.value, elm_L.value));
        elm_num_border.innerHTML = num;
        elm_num.innerHTML = num;
        var image = new Image;
        image.onload = function(){
            ctx.save();
            ctx.clearRect(0,0,parseInt(canvas.width), parseInt(canvas.height));
            ctx.drawImage(image, 0, 0);
            ctx.restore();
            zip.file("number" + ("000"+num).slice(-3) + "_" + elm_size.value + "x" + elm_size.value + ".png", dataURL2Blob(canvas.toDataURL("image/png"), "image/png"));
            ary_now_idx++;
        };
        var svg_data = new XMLSerializer().serializeToString(elm_svg)
        zip.file("number" + ("000"+num).slice(-3) + "_" + elm_size.value + "x" + elm_size.value + ".svg", svg_data);
        image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svg_data)));
        if(elm_cc.checked)
            now_h += h_add;
    });
    
    var tmr_id = setInterval(function(){
        if(ary_now_idx >= parseInt(elm_end.value)-parseInt(elm_start.value)){
            zip.generateAsync({type:"base64"}).then(function(b64){
                var a = document.createElement("a");
                a.href = "data:application/zip;base64," + b64;
                a.setAttribute("download", "number" + ("000"+elm_start.value).slice(-3) + "-"
                                + ("000"+elm_end.value).slice(-3) + "_"
                                + elm_size.value + "x" + elm_size.value + ".zip");
                a.dispatchEvent(new CustomEvent("click"));
            });
            clearInterval(tmr_id);
            tmr_id = null;
        }
    }, 100);
}

function previewSVG(){
    var elm_H = document.getElementById("color-h");
    var elm_S = document.getElementById("color-s");
    var elm_L = document.getElementById("color-l");
    var elm_size = document.getElementById("img-size");
    var elm_start = document.getElementById("num-start");
    var elm_num_border = document.getElementById("svg-num-border");
    var elm_num = document.getElementById("svg-num");
    var elm_circle = document.getElementById("svg-circle");
    var elm_svg = document.getElementById("svg-preview");

    elm_svg.setAttribute("width", elm_size.value + "px");
    elm_svg.setAttribute("height", elm_size.value + "px");
    elm_circle.setAttribute("fill", hsl2htmlColor(elm_H.value, elm_S.value, elm_L.value));
    elm_num_border.innerHTML = elm_start.value;
    elm_num.innerHTML = elm_start.value;
}