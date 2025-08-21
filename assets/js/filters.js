import { API } from "./api.js";

export const filterState = {
    personnel: { departmentID: "", locationID: "" },
    departments: { locationID: "" },
    locations: {}
};

function isActive(sel) {
    return $(sel).filter(".active").length > 0;
}

export function bindFilterModal({ loadPersonnel, loadDepartments, loadLocations }) {
   
    $("#filterModal").off("show.bs.modal").on("show.bs.modal", function () {
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
            // Departments for personnel filter
            API.getAllDepartments().done((res) => {
                const $dep = $("#personnelFilterDepartment").empty()
                    .append('<option value="">All departments</option>');
                (Array.isArray(res?.data) ? res.data : []).forEach(d => {
                    $dep.append(`<option value="${d.id}">${d.department}</option>`);
                });
                if (filterState.personnel.departmentID) $dep.val(filterState.personnel.departmentID);
            });

            // Locations for personnel filter
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
            // Locations for departments filter
            API.getAllLocations().done((res) => {
                const $sel = $("#departmentsFilterLocation").empty()
                    .append('<option value="">All locations</option>');
                (Array.isArray(res?.data) ? res.data : []).forEach(loc => {
                    $sel.append(`<option value="${loc.id}">${loc.name}</option>`);
                });
                if (filterState.departments.locationID) $sel.val(filterState.departments.locationID);
            });
        }
    });

    // APPLY — clear search if a filter is set (so filters take effect)
    $("#filterApplyBtn").off("click").on("click", function () {
        const rawQ = $("#searchInp").val().trim();

        if (isActive("#personnelBtn")) {
            const dep = $("#personnelFilterDepartment").val() || "";
            const loc = $("#personnelFilterLocation").val() || "";
            filterState.personnel.departmentID = dep;
            filterState.personnel.locationID = loc;

            const qToUse = (dep || loc) ? "" : rawQ;
            if (dep || loc) $("#searchInp").val(""); // keep UI in sync
            loadPersonnel(qToUse, filterState.personnel);

        } else if (isActive("#departmentsBtn, #departmentBtn")) {
            const loc = $("#departmentsFilterLocation").val() || "";
            filterState.departments.locationID = loc;

            const qToUse = loc ? "" : rawQ;
            if (loc) $("#searchInp").val("");
            loadDepartments(qToUse, filterState.departments);

        } else if (isActive("#locationsBtn, #locationBtn")) {
            loadLocations(rawQ);
        }

        $("#filterModal").modal("hide");
    });

    // CLEAR — reset state/selects and reload with current search
    $("#filterClearBtn").off("click").on("click", function () {
        const rawQ = $("#searchInp").val().trim();

        if (isActive("#personnelBtn")) {
            filterState.personnel = { departmentID: "", locationID: "" };
            $("#personnelFilterDepartment").val("");
            $("#personnelFilterLocation").val("");
            loadPersonnel(rawQ, filterState.personnel);

        } else if (isActive("#departmentsBtn, #departmentBtn")) {
            filterState.departments = { locationID: "" };
            $("#departmentsFilterLocation").val("");
            loadDepartments(rawQ, filterState.departments);

        } else if (isActive("#locationsBtn, #locationBtn")) {
            loadLocations(rawQ);
        }

        $("#filterModal").modal("hide");
    });
}
