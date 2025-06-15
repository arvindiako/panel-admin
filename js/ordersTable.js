  // Persian number conversion function
  function toPersianNumbers(str) {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
    return str.toString().replace(/\d/g, (digit) => persianDigits[Number.parseInt(digit)])
  }

  // Sample data with Persian names and content
  const allOrders = []
  const baseOrders = [
    {
      id: 1,
      customerName: "فاطمه احمدی",
      orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
      orderType: "تحویل در منزل",
      trackingId: "9348fjr73",
      orderTotal: "۲۵,۰۰۰ تومان",
      status: "تکمیل شده",
    },
    {
      id: 2,
      customerName: "علی محمدی",
      orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
      orderType: "تحویل در منزل",
      trackingId: "9348fjr74",
      orderTotal: "۲۵,۰۰۰ تومان",
      status: "در حال پردازش",
    },
    {
      id: 3,
      customerName: "مریم رضایی",
      orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
      orderType: "تحویل حضوری",
      trackingId: "9348fjr75",
      orderTotal: "۲۵,۰۰۰ تومان",
      status: "در انتظار",
    },
    {
      id: 4,
      customerName: "حسن کریمی",
      orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
      orderType: "تحویل حضوری",
      trackingId: "9348fjr76",
      orderTotal: "۲۵,۰۰۰ تومان",
      status: "تکمیل شده",
    },
    {
      id: 5,
      customerName: "زهرا موسوی",
      orderDate: "۲۱ مرداد ۱۴۰۱ - ۱۲:۲۵",
      orderType: "تحویل حضوری",
      trackingId: "9348fjr77",
      orderTotal: "۲۵,۰۰۰ تومان",
      status: "تکمیل شده",
    },
  ]

  // Generate 200 orders for pagination testing
  for (let i = 0; i < 200; i++) {
    const baseOrder = baseOrders[i % baseOrders.length]
    allOrders.push({
      ...baseOrder,
      id: i + 1,
      trackingId: `9348fjr${(73 + i).toString().padStart(2, "0")}`,
      customerName: baseOrder.customerName + (i > 4 ? ` ${i + 1}` : ""),
    })
  }

  let currentPage = 1
  let itemsPerPage = 10
  let selectedRows = []
  const $ = window.$
  const bootstrap = window.bootstrap

  // Status translation mapping
  const statusTranslation = {
    "تکمیل شده": "completed",
    "در حال پردازش": "in-progress",
    "در انتظار": "pending",
  }

  // Initialize table
  function initTable() {
    updateTable()
    updatePagination()
    bindEvents()
  }

  // Update table content
  function updateTable() {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentOrders = allOrders.slice(startIndex, endIndex)

    const tableBody = $("#tableBody")
    tableBody.empty()

    currentOrders.forEach((order) => {
      const statusClass = statusTranslation[order.status] || "pending"
      const isChecked = selectedRows.includes(order.id) ? "checked" : ""

      const row = `
                <tr class="base_order" data-id="${order.id}">
                    <td>
                        <input type="checkbox" class="form-check-input row-checkbox" data-id="${order.id}" ${isChecked}>
                    </td>
                    <td class="customer-name">${order.customerName}</td>
                    <td class="order-date">${order.orderDate}</td>
                    <td class="delivery-method">${order.orderType}</td>
                    <td class="tracking-code">
                        <div class="tracking-id">
                            <span class="tracking-code-init">${order.trackingId}</span>
                            <button class="copy-btn" data-tracking="${order.trackingId}" title="کپی کردن">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td class="total-price">${order.orderTotal}</td>
                    <td>
                        <div class="action-dropdown">
                            <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                ${order.status}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item action-item" data-id="${order.id}" data-action="تکمیل شده">تکمیل شده</a></li>
                                <li><a class="dropdown-item action-item" data-id="${order.id}" data-action="در حال پردازش">در حال پردازش</a></li>
                                <li><a class="dropdown-item action-item" data-id="${order.id}" data-action="در انتظار">در انتظار</a></li>
                            </ul>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${order.status}</span>
                    </td>
                </tr>
            `
      tableBody.append(row)
    })

    // Update select all checkbox
    updateSelectAllCheckbox()
  }

  // Update pagination controls
  function updatePagination() {
    const totalPages = Math.ceil(allOrders.length / itemsPerPage)
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, allOrders.length)

    // Update items range with Persian numbers
    $("#itemsRange").text(
      `${toPersianNumbers(startItem)}-${toPersianNumbers(endItem)} از ${toPersianNumbers(allOrders.length)} آیتم`,
    )

    // Update pages info with Persian numbers
    $("#pagesInfo").text(`از ${toPersianNumbers(totalPages)} صفحه`)

    // Update page select options
    const pageSelect = $("#pageSelect")
    pageSelect.empty()
    for (let i = 1; i <= totalPages; i++) {
      pageSelect.append(`<option value="${i}" ${i === currentPage ? "selected" : ""}>${toPersianNumbers(i)}</option>`)
    }

    // Update navigation buttons (note: in RTL, next/prev are swapped)
    $("#prevBtn").prop("disabled", currentPage === totalPages)
    $("#nextBtn").prop("disabled", currentPage === 1)
  }

  // Update select all checkbox state
  function updateSelectAllCheckbox() {
    const currentPageIds = []
    $("#tableBody tr").each(function () {
      currentPageIds.push(Number.parseInt($(this).data("id")))
    })

    const allCurrentSelected = currentPageIds.every((id) => selectedRows.includes(id))
    const someCurrentSelected = currentPageIds.some((id) => selectedRows.includes(id))

    const selectAllCheckbox = $("#selectAll")
    selectAllCheckbox.prop("checked", allCurrentSelected)
    selectAllCheckbox.prop("indeterminate", someCurrentSelected && !allCurrentSelected)
  }

  // Bind events
  function bindEvents() {
    // Items per page change
    $("#itemsPerPage").on("change", function () {
      itemsPerPage = Number.parseInt($(this).val())
      currentPage = 1
      updateTable()
      updatePagination()
    })

    // Page select change
    $("#pageSelect").on("change", function () {
      currentPage = Number.parseInt($(this).val())
      updateTable()
      updatePagination()
    })

    // Previous/Next buttons (swapped for RTL)
    $("#prevBtn").on("click", () => {
      const totalPages = Math.ceil(allOrders.length / itemsPerPage)
      if (currentPage < totalPages) {
        currentPage++
        updateTable()
        updatePagination()
      }
    })

    $("#nextBtn").on("click", () => {
      if (currentPage > 1) {
        currentPage--
        updateTable()
        updatePagination()
      }
    })

    // Select all checkbox
    $("#selectAll").on("change", function () {
      const isChecked = $(this).is(":checked")
      const currentPageIds = []

      $("#tableBody tr").each(function () {
        currentPageIds.push(Number.parseInt($(this).data("id")))
      })

      if (isChecked) {
        currentPageIds.forEach((id) => {
          if (!selectedRows.includes(id)) {
            selectedRows.push(id)
          }
        })
      } else {
        selectedRows = selectedRows.filter((id) => !currentPageIds.includes(id))
      }

      $(".row-checkbox").prop("checked", isChecked)
    })

    // Individual row checkboxes
    $(document).on("change", ".row-checkbox", function () {
      const id = Number.parseInt($(this).data("id"))
      const isChecked = $(this).is(":checked")

      if (isChecked) {
        if (!selectedRows.includes(id)) {
          selectedRows.push(id)
        }
      } else {
        selectedRows = selectedRows.filter((rowId) => rowId !== id)
      }

      updateSelectAllCheckbox()
    })

    // Copy tracking ID
     $(document).on("click", ".copy-btn", function () {
        const trackingId = $(this).data("tracking");

        // Copy to clipboard
        const $temp = $("<textarea>");
        $("body").append($temp);
        $temp.val(trackingId).select();
        document.execCommand("copy");
        $temp.remove();

        // Show custom notification
        showNotification("کد پیگیری با موفقیت کپی شد", "success", {
            showDates: false
        });
    });


    // Action dropdown items
    $(document).on("click", ".action-item", function (e) {
      e.preventDefault()
      const orderId = Number.parseInt($(this).data("id"))
      const newStatus = $(this).data("action")

      // Update the order in allOrders array
      const orderIndex = allOrders.findIndex((order) => order.id === orderId)
      if (orderIndex !== -1) {
        allOrders[orderIndex].status = newStatus
      }

      // Update the table display
      updateTable()
    })
  }

  // Initialize the table
  initTable()
