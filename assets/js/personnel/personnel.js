import { API } from "../api.js";

export function loadPersonnel(q = "", filters = {}) {
    const dep = filters.departmentID || "";
    const loc = filters.locationID || "";

    let url;
    if (q) {
        // When searching use SearchAll.php
        url = "libs/php/SearchAll.php?txt=" + encodeURIComponent(q);
    } else if (dep || loc) {
        // Filtered listing via getAll.php with params
        const params = new URLSearchParams();
        if (dep) params.append("departmentID", dep);
        if (loc) params.append("locationID", loc);
        url = "libs/php/getAll.php?" + params.toString();
    } else {
        // Unfiltered
        url = "libs/php/getAll.php";
    }

    $.ajax({
        url,
        type: "GET",
        dataType: "json",
        success: function (result) {
            let rows = [];
            if (q) {
                const found = (result?.data?.found) || [];
                rows = found
                    .filter(x => (x.entity === "personnel") || ("firstName" in x && "lastName" in x))
                    .map(p => ({
                        id: p.id,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        jobTitle: p.jobTitle ?? "",
                        location: p.locationName ?? p.location ?? "",
                        email: p.email ?? ""
                    }));
            } else {
                rows = result.data || [];
            }

            const tbody = $("#personnelTableBody").empty();
            rows.forEach(person => {
                const row = `
          <tr>
            <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.jobTitle}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location ?? ""}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
            <td class="text-end text-nowrap">
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                      data-bs-target="#editPersonnelModal" data-id="${person.id}">
                <i class="fa-solid fa-pencil fa-fw"></i>
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                      data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `;
                tbody.append(row);
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
}