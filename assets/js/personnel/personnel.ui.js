import { API } from "../api.js";
import { filterState } from "../filters.js";

function populateDepartments($select) {
    return API.getAllDepartments().then(res => {
        const items = Array.isArray(res?.data) ? res.data : [];
        $select.empty();
        items.forEach(d => $select.append(`<option value="${d.id}">${d.department}</option>`));
    });
}

export function bindPersonnelUI({ loadPersonnel }) {

    // ADD PERSONNEL
    $("#addPersonnelModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function () {
            $("#addPersonnelForm")[0]?.reset();
            populateDepartments($("#addPersonnelDepartment"));
        });

    $("#addPersonnelForm")
        .off("submit")
        .on("submit", function (e) {
            e.preventDefault();
            const data = $(this).serialize();
            $.ajax({
                url: "libs/php/personnel/insertPersonnel.php",
                type: "POST",
                dataType: "json",
                data
            })
                .done(() => {
                    $("#addPersonnelModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadPersonnel(q, filterState.personnel);
                })
                .fail((x, t, e) => console.error("insertPersonnel failed:", t, e));
        });

    // EDIT PERSONNEL
    $("#editPersonnelModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function (e) {
            const id = $(e.relatedTarget).data("id");
            if (!id) { console.warn("editPersonnel: missing data-id"); return; }

            $("#editPersonnelForm")[0]?.reset();
            $("#editPersonnelEmployeeID").val(id);

            const personReq = API.getPersonnelById(id);
            const depsReq = API.getAllDepartments();

            $.when(personReq, depsReq).done((pres, dres) => {
                const personData = pres[0];
                const depsData = dres[0];

                
                const envelope = personData?.data || {};
                const p = Array.isArray(envelope.personnel) ? envelope.personnel[0] : envelope.personnel || {};

                const items = Array.isArray(depsData?.data) ? depsData.data : [];
                const $dep = $("#editPersonnelDepartment").empty();
                items.forEach(d => $dep.append(`<option value="${d.id}">${d.department}</option>`));

            
                $("#editPersonnelFirstName").val(p.firstName || "");
                $("#editPersonnelLastName").val(p.lastName || "");
                $("#editPersonnelJobTitle").val(p.jobTitle || "");
                $("#editPersonnelEmailAddress").val(p.email || "");

                if (p.departmentID != null) $dep.val(String(p.departmentID));
            })
                .fail((x, t, e) => console.error("load edit data failed:", t, e));
        });


    $("#editPersonnelForm")
        .off("submit")
        .on("submit", function (e) {
            e.preventDefault();
            const data = $(this).serialize();
            $.ajax({
                url: "libs/php/personnel/updatePersonnelByID.php",
                type: "POST",
                dataType: "json",
                data
            })
                .done(() => {
                    $("#editPersonnelModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadPersonnel(q, filterState.personnel);
                })
                .fail((x, t, e) => console.error("updatePersonnel failed:", t, e));
        });

    // DELETE PERSONNEL
    $("#deletePersonnelModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function (e) {
            const btn = $(e.relatedTarget);
            const id = btn.data("id");
            const name = btn.data("name") || "";
            $("#deletePersonnelID").val(id);
            $("#deletePersonnelName").text(name);
        });

    $("#confirmDeletePersonnelBtn")
        .off("click")
        .on("click", function () {
            const id = $("#deletePersonnelID").val();
            if (!id) return;
            $.ajax({
                url: "libs/php/personnel/deletePersonnelByID.php",
                type: "POST",
                dataType: "json",
                data: { id }
            })
                .done((res) => {
                    // check res.status.code is 200
                    $("#deletePersonnelModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadPersonnel(q, filterState.personnel);
                })
                .fail((x, t, e) => {
                    console.error("deletePersonnel failed:", t, e);
                    $("#deletePersonnelError").removeClass("d-none").text("Unable to delete.");
                });
        });
}
