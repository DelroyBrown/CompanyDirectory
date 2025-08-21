import { filterState } from "./filters.js";

function activeTab() {
    if ($("#personnelBtn").hasClass("active")) return "personnel";
    if ($("#departmentsBtn, #departmentBtn").filter(".active").length) return "departments";
    if ($("#locationsBtn, #locationBtn").filter(".active").length) return "locations";
    return "personnel";
}

export function bindRefresh({ loadPersonnel, loadDepartments, loadLocations }) {
    $("#refreshBtn").off("click").on("click", function () {
        const q = $("#searchInp").val().trim();
        const tab = activeTab();

        if (tab === "personnel") {
            loadPersonnel(q, filterState.personnel);
        } else if (tab === "departments") {
            loadDepartments(q, filterState.departments);
        } else {
            loadLocations(q);
        }
    });
}
