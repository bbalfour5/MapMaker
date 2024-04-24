var downloadAsSVG = function (fileName) {

    if (!fileName) {
        fileName = "newMap.svg"
    }

    var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({ asString: true }));

    var link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
}