import { API } from "./api.js";

export function bindAddModals() {
    // Add Personnel
    $("#addPersonnelModal").off("show.bs.modal").on("show.bs.modal", function () {
        $("#addPersonnelForm")[0]?.reset();
        const $dep = $("#addPersonnelDepartment").empty();
        API.getAllDepartments().done(res => {
            (Array.isArray(res?.data) ? res.data : []).forEach(d => {
                $dep.append(`<option value="${d.id}">${d.department}</option>`);
            });
        });
    });

    // Add Department
    $("#addDepartmentModal").off("show.bs.modal").on("show.bs.modal", function () {
        $("#addDepartmentForm")[0]?.reset();
        const $loc = $("#addDepartmentLocation").empty();
        API.getAllLocations().done(res => {
            (Array.isArray(res?.data) ? res.data : []).forEach(l => {
                $loc.append(`<option value="${l.id}">${l.name}</option>`);
            });
        });
    });

    // Add Location: simple reset
    $("#addLocationModal").off("show.bs.modal").on("show.bs.modal", function () {
        $("#addLocationForm")[0]?.reset();
        $("#addLocationError").addClass("d-none");
    });
}
