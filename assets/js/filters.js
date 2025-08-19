import { API } from "./api.js";

export const filterState = {
    personnel: { departmentID: "", locationID: "" },
    departments: { locationID: "" },
    locations: {}
};

function isActive(idOrList) {
    return $(idOrList).filter(".active").length > 0;
}

export function bindFilterModal({ loadPersonnel, loadDepartments, loadLocations }) {
    // OPEN modal single button for all tabs
    $("#filterBtn").off("click").on("click", function () {
        const onPersonnel = isActive("#personnelBtn");
        const onDepartments = isActive("#departmentsBtn, #departmentBtn");
        const onLocations = isActive("#locationsBtn, #locationBtn");

        $("#filters-personnel").toggleClass("d-none", !onPersonnel);
        $("#filters-departments").toggleClass("d-none", !onDepartments);
        $("#filters-locations").toggleClass("d-none", !onLocations);

        $("#filterModalLabel").text(
            onPersonnel ? "Personnel Filters" :
                onDepartments ? "Department Filters" : "Location Filters"
        );

        if (onPersonnel) {
            // Departments
            API.getAllDepartments().done((res) => {
                const $dep = $("#personnelFilterDepartment").empty()
                    .append('<option value="">All departments</option>');
                (Array.isArray(res?.data) ? res.data : []).forEach(d => {
                    $dep.append(`<option value="${d.id}">${d.department}</option>`);
                });
                if (filterState.personnel.departmentID) $dep.val(filterState.personnel.departmentID);
            });

            // Locations
            API.getAllLocations().done((res) => {
                const $loc = $("#personnelFilterLocation").empty()
                    .append('<option value="">All locations</option>');
                (Array.isArray(res?.data) ? res.data : []).forEach(l => {
                    $loc.append(`<option value="${l.id}">${l.name}</option>`);
                });
                if (filterState.personnel.locationID) $loc.val(filterState.personnel.locationID);
            });
        }

        if (onDepartments) {
            API.getAllLocations().done((res) => {
                const $sel = $("#departmentsFilterLocation").empty()
                    .append('<option value="">All locations</option>');
                (Array.isArray(res?.data) ? res.data : []).forEach(loc => {
                    $sel.append(`<option value="${loc.id}">${loc.name}</option>`);
                });
                if (filterState.departments.locationID) $sel.val(filterState.departments.locationID);
            });
        }

        new bootstrap.Modal(document.getElementById("filterModal")).show();
    });

    // APPLY
    $("#filterApplyBtn").off("click").on("click", function () {
        const rawQ = $("#searchInp").val().trim();

        if (isActive("#personnelBtn")) {
            const dep = $("#personnelFilterDepartment").val() || "";
            const loc = $("#personnelFilterLocation").val() || "";
            filterState.personnel.departmentID = dep;
            filterState.personnel.locationID = loc;

            // If any personnel filter is set, ignore search and show filtered results
            const qToUse = (dep || loc) ? "" : rawQ;
            if (dep || loc) $("#searchInp").val("");   // keep UI in sync
            loadPersonnel(qToUse, filterState.personnel);

        } else if (isActive("#departmentsBtn, #departmentBtn")) {
            const loc = $("#departmentsFilterLocation").val() || "";
            filterState.departments.locationID = loc;

            // If a departments filter is set, ignore search and show filtered results
            const qToUse = loc ? "" : rawQ;
            if (loc) $("#searchInp").val("");
            loadDepartments(qToUse, filterState.departments);

        } else if (isActive("#locationsBtn, #locationBtn")) {
            loadLocations(rawQ); // no filters for locations (yet)
        }

        $("#filterModal").modal("hide");
    });


    // CLEAR
    $("#filterClearBtn").off("click").on("click", function () {
        const q = $("#searchInp").val().trim();

        if (isActive("#personnelBtn")) {
            filterState.personnel = { departmentID: "", locationID: "" };
            $("#personnelFilterDepartment").val("");
            $("#personnelFilterLocation").val("");
            loadPersonnel(q, filterState.personnel);

        } else if (isActive("#departmentsBtn, #departmentBtn")) {
            filterState.departments = { locationID: "" };
            $("#departmentsFilterLocation").val("");
            loadDepartments(q, filterState.departments);

        } else if (isActive("#locationsBtn, #locationBtn")) {
            loadLocations(q);
        }

        $("#filterModal").modal("hide");
    });
}
