import { API } from "../api.js";

export function loadLocations(q = "") {
    const useSearch = q.length > 0;
    const url = useSearch
        ? "libs/php/SearchAll.php?txt=" + encodeURIComponent(q)
        : "libs/php/locations/getAllLocations.php";

    $.ajax({
        url,
        type: "GET",
        dataType: "json",
        success: function (result) {
            let rows = [];
            if (useSearch) {
                const found = (result?.data?.found) || [];
                rows = found
                    .filter(x => (x.entity === "location") || (x.name && !x.department && !x.firstName))
                    .map(l => ({ id: l.id, name: l.name }));
            } else {
                rows = result.data;
            }

            $("#locationTableBody").html("");
            rows.forEach(location => {
                $("#locationTableBody").append(`
                <tr>
                  <td class="align-middle text-nowrap">${location.name}</td>
                  <td class="align-middle text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm"
                            data-bs-toggle="modal" data-bs-target="#editLocationModal"
                            data-id="${location.id}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm"
                            data-bs-toggle="modal" data-bs-target="#deleteLocationModal"
                            data-id="${location.id}" data-name="${location.name}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
              `);
            });
        },
        error: function () {
            alert("AJAX error loading locations");
        }
    });
}