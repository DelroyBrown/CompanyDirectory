function debounce(fn, ms = 300) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function activeTab() {
    if ($("#personnelBtn").hasClass("active")) return "personnel";
    if ($("#departmentsBtn, #departmentBtn").filter(".active").length) return "departments";
    if ($("#locationsBtn, #locationBtn").filter(".active").length) return "locations";
    return "personnel";
}

export function bindSearch({ loadPersonnel, loadDepartments, loadLocations }) {
    $("#searchInp").off("input").on("input", debounce(() => {
        const q = $("#searchInp").val().trim();
        const tab = activeTab();
        if (tab === "personnel") loadPersonnel(q);
        else if (tab === "departments") loadDepartments(q);
        else loadLocations(q);
    }, 300));
}
