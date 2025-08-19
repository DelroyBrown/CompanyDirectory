import { API } from "./api.js";

export function loadDepartments(q = "", filters = {}) {
    const useSearch = (q || "").trim().length > 0;
    const locationID = (filters && filters.locationID) ? String(filters.locationID) : "";

    let url;
    if (useSearch) {
        // Search takes precedence over filters
        url = "libs/php/SearchAll.php?txt=" + encodeURIComponent(q);
    } else if (locationID) {
        // Filtered list by location
        url = "libs/php/getAllDepartments.php?locationID=" + encodeURIComponent(locationID);
    } else {
        // Unfiltered list
        url = "libs/php/getAllDepartments.php";
    }

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (result) {
            let rows = [];
            if (useSearch) {
                const found = (result && result.data && Array.isArray(result.data.found)) ? result.data.found : [];
                rows = found
                    .filter(x => (x.entity === "department") || (x.name && !x.firstName && !x.lastName))
                    .map(d => ({
                        id: d.id,
                        department: d.name, // map to your expected field
                        location: d.locationName ?? d.location ?? ""
                    }));
            } else {
                rows = result.data || [];
            }

            const $tbody = $("#departmentTableBody").empty();
            rows.forEach(dept => {
                $tbody.append(`
          <tr>
            <td class="align-middle text-nowrap">${dept.department}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${dept.location}</td>
            <td class="align-middle text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                      data-bs-target="#editDepartmentModal" data-id="${dept.id}">
                <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteDepartmentModal"
                      data-id="${dept.id}"
                      data-name="${dept.department}">
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `);
            });
        },
        error: function () {
            alert("Failed to load departments");
        }
    });
}