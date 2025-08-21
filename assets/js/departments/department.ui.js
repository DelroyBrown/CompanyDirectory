import { API } from "../api.js";
import { filterState } from "../filters.js";

function populateLocations($select) {
    return API.getAllLocations().then(res => {
        const items = Array.isArray(res?.data) ? res.data : [];
        $select.empty();
        items.forEach(l => $select.append(`<option value="${l.id}">${l.name}</option>`));
    });
}

export function bindDepartmentsUI({ loadDepartments }) {
    // Add Department
    $("#addDepartmentModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function () {
            $("#addDepartmentForm")[0]?.reset();
            populateLocations($("#addDepartmentLocation"));
            $("#addDepartmentError").addClass("d-none");
        });

    $("#addDepartmentForm")
        .off("submit")
        .on("submit", function (e) {
            e.preventDefault();
            const data = $(this).serialize();
            $.ajax({
                url: "libs/php/insertDepartment.php",
                type: "POST",
                dataType: "json",
                data
            })
                .done(res => {
                    $("#addDepartmentModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadDepartments(q, filterState.departments);
                })
                .fail((x, t, e) => {
                    console.error("insertDepartment failed:", t, e);
                    $("#addDepartmentError").removeClass("d-none").text("Unable to add department.");
                });
        });

    // Edit Department
    $("#editDepartmentModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function (e) {
            const id = $(e.relatedTarget).data("id");
            if (!id) { console.warn("editDepartment: missing data-id"); return; }

            $("#editDepartmentForm")[0]?.reset();
            $("#editDepartmentID").val(id);
            $("#editDepartmentError").addClass("d-none");

            const depReq = API.getDepartmentById(id);
            const locReq = API.getAllLocations();

            $.when(depReq, locReq).done((dres, lres) => {
                const depData = dres[0];
                const locData = lres[0];

                const d = Array.isArray(depData?.data) ? depData.data[0] : depData?.data || {};
                const locations = Array.isArray(locData?.data) ? locData.data : [];

                const $loc = $("#editDepartmentLocation").empty();
                locations.forEach(l => $loc.append(`<option value="${l.id}">${l.name}</option>`));

                $("#editDepartmentName").val(d.name || d.department || "");
                if (d.locationID != null) { $loc.val(String(d.locationID)); }
            })
                .fail((x, t, e) => {
                    console.error("load edit department failed:", t, e);
                    $("#editDepartmentError").removeClass("d-none").text("Failed to load department.");
                });
        });

    $("#editDepartmentForm")
        .off("submit")
        .on("submit", function (e) {
            e.preventDefault();
            const data = $(this).serialize();
            $.ajax({
                url: "libs/php/updateDepartment.php",
                type: "POST",
                dataType: "json",
                data
            })
                .done(() => {
                    $("#editDepartmentModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadDepartments(q, filterState.departments);
                })
                .fail((x, t, e) => {
                    console.error("updateDepartment failed:", t, e);
                    $("#editDepartmentError").removeClass("d-none").text("Unable to update department.");
                });
        });

    // Delete Department
    $("#deleteDepartmentModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function (e) {
            const btn = $(e.relatedTarget);
            const id = btn.data("id");
            const name = btn.data("name") || "";
            $("#deleteDepartmentID").val(id);
            $("#deleteDepartmentName").text(name);
            $("#deleteDepartmentError").addClass("d-none");
        });

    $("#confirmDeleteDepartmentBtn")
        .off("click")
        .on("click", function () {
            const id = $("#deleteDepartmentID").val();
            if (!id) return;
            $.ajax({
                url: "libs/php/deleteDepartmentByID.php",
                type: "POST",
                dataType: "json",
                data: { id }
            })
                .done(res => {

                    const code = res?.status?.code || res?.statusCode;
                    if (String(code) === "409") {
                        $("#deleteDepartmentError")
                            .removeClass("d-none")
                            .text("Cannot delete: this department has dependent personnel.");
                        return;
                    }
                    $("#deleteDepartmentModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadDepartments(q, filterState.departments);
                })
                .fail((x, t, e) => {
                    console.error("deleteDepartment failed:", t, e);
                    $("#deleteDepartmentError").removeClass("d-none").text("Unable to delete department.");
                });
        });
}
