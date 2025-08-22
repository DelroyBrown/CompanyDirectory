import { filterState } from "../filters.js";

export function bindLocationsUI({ loadLocations }) {
    // Add Location
    $("#addLocationModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function () {
            $("#addLocationForm")[0]?.reset();
            $("#addLocationError").addClass("d-none");
        });

    $("#addLocationForm")
        .off("submit")
        .on("submit", function (e) {
            e.preventDefault();
            const name = $("#addLocationName").val().trim();
            if (!name) {
                $("#addLocationError").removeClass("d-none").text("Name is required.");
                return;
            }

            $.ajax({
                url: "libs/php/locations/insertLocation.php",
                type: "POST",
                dataType: "json",
                data: { name }
            })
                .done((res) => {
                    if (String(res?.status?.code) !== "200") {
                        $("#addLocationError").removeClass("d-none").text("Failed to add location.");
                        return;
                    }
                    $("#addLocationModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadLocations(q); // no filters on locations
                })
                .fail(() => $("#addLocationError").removeClass("d-none").text("AJAX error while adding."));
        });

    // Edit Locations
    $("#editLocationModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function (e) {
            const id = $(e.relatedTarget).data("id");
            if (!id) { console.warn("editLocation: missing data-id"); return; }

            $("#editLocationForm")[0]?.reset();
            $("#editLocationID").val(id);
            $("#editLocationError").addClass("d-none");

            $.ajax({
                url: "libs/php/locations/getLocationByID.php",
                type: "GET",
                dataType: "json",
                data: { id }
            })
                .done((result) => {
                    if (String(result?.status?.code) !== "200") {
                        $("#editLocationError").removeClass("d-none").text("Failed to fetch location.");
                        return;
                    }
                    const row = Array.isArray(result?.data) ? result.data[0] : result?.data;
                    $("#editLocationName").val(row?.name || "");
                })
                .fail(() => $("#editLocationError").removeClass("d-none").text("AJAX error fetching location."));
        });

    $("#editLocationForm")
        .off("submit")
        .on("submit", function (e) {
            e.preventDefault();
            const id = $("#editLocationID").val();
            const name = $("#editLocationName").val().trim();
            if (!name) {
                $("#editLocationError").removeClass("d-none").text("Name is required.");
                return;
            }

            $.ajax({
                url: "libs/php/locations/updateLocation.php",
                type: "POST",
                dataType: "json",
                data: { id, name }
            })
                .done((res) => {
                    if (String(res?.status?.code) !== "200") {
                        $("#editLocationError").removeClass("d-none").text("Failed to update location.");
                        return;
                    }
                    $("#editLocationModal").modal("hide");
                    const q = $("#searchInp").val().trim();
                    loadLocations(q);
                })
                .fail(() => $("#editLocationError").removeClass("d-none").text("AJAX error updating location."));
        });

    // Delete Location
    $("#deleteLocationModal")
        .off("show.bs.modal")
        .on("show.bs.modal", function (e) {
            const btn = $(e.relatedTarget);
            const id = btn.data("id");
            const name = btn.data("name") || "";
            $("#deleteLocationID").val(id);
            $("#deleteLocationMessage").html(`Are you sure you want to delete <strong>${name}</strong>?`);
            $("#deleteLocationError").addClass("d-none");
        });

    $("#confirmDeleteLocationBtn")
        .off("click")
        .on("click", function () {
            const id = $("#deleteLocationID").val();
            if (!id) return;

            $.ajax({
                url: "libs/php/locations/deleteLocationByID.php",
                type: "POST",
                dataType: "json",
                data: { id }
            })
                .done((res) => {
                    const code = String(res?.status?.code || "");
                    if (code === "409") {
                        $("#deleteLocationError").removeClass("d-none").text("Cannot delete: this location has dependent departments.");
                        return;
                    }
                    if (code === "200") {
                        $("#deleteLocationModal").modal("hide");
                        const q = $("#searchInp").val().trim();
                        loadLocations(q);
                    } else {
                        $("#deleteLocationError").removeClass("d-none").text("Delete failed.");
                    }
                })
                .fail(() => $("#deleteLocationError").removeClass("d-none").text("AJAX error during delete."));
        });
}
