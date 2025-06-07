$(document).ready(function () {
    // تنظیمات تقویم جلالی
    const jalaliMonths = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];

    // کلاس تاریخ جلالی
    class JalaliDate {
        constructor(jy = null, jm = null, jd = null) {
            if (jy === null) {
                const now = new Date();
                const jalali = jalaali.toJalaali(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    now.getDate()
                );
                this.jy = jalali.jy;
                this.jm = jalali.jm;
                this.jd = jalali.jd;
            } else {
                this.jy = jy;
                this.jm = jm;
                this.jd = jd;
            }
        }

        year() { return this.jy; }
        month() { return this.jm; }
        date() { return this.jd; }

        clone() {
            return new JalaliDate(this.jy, this.jm, this.jd);
        }

        subtract(amount, unit) {
            if (unit === "day") {
                const gregorian = jalaali.toGregorian(this.jy, this.jm, this.jd);
                const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
                date.setDate(date.getDate() - amount);
                const jalali = jalaali.toJalaali(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    date.getDate()
                );
                return new JalaliDate(jalali.jy, jalali.jm, jalali.jd);
            }
            return this;
        }

        add(amount, unit) {
            if (unit === "month") {
                let newMonth = this.jm + amount;
                let newYear = this.jy;

                while (newMonth > 12) {
                    newMonth -= 12;
                    newYear++;
                }
                while (newMonth < 1) {
                    newMonth += 12;
                    newYear--;
                }

                const daysInNewMonth = this.getDaysInMonth(newYear, newMonth);
                const newDay = Math.min(this.jd, daysInNewMonth);

                this.jy = newYear;
                this.jm = newMonth;
                this.jd = newDay;
            }
            return this;
        }

        getDaysInMonth(year, month) {
            if (month <= 6) return 31;
            if (month <= 11) return 30;
            return jalaali.isLeapJalaaliYear(year) ? 30 : 29;
        }

        getFirstDayOfMonth() {
            const gregorian = jalaali.toGregorian(this.jy, this.jm, 1);
            const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
            return (date.getDay() + 1) % 7;
        }

        isSame(other) {
            return this.jy === other.jy && this.jm === other.jm && this.jd === other.jd;
        }

        isAfter(other) {
            if (this.jy > other.jy) return true;
            if (this.jy < other.jy) return false;
            if (this.jm > other.jm) return true;
            if (this.jm < other.jm) return false;
            return this.jd > other.jd;
        }

        isBefore(other) {
            if (this.jy < other.jy) return true;
            if (this.jy > other.jy) return false;
            if (this.jm < other.jm) return true;
            if (this.jm > other.jm) return false;
            return this.jd < other.jd;
        }

        format() {
            return `${this.jd} ${jalaliMonths[this.jm - 1]} ${this.jy}`;
        }

        toGregorian() {
            return jalaali.toGregorian(this.jy, this.jm, this.jd);
        }
    }

    // وضعیت برنامه
    let currentCalendarDate = new JalaliDate();
    let selectedStartDate = null;
    let selectedEndDate = null;
    let currentDateType = null;
    let currentView = "days";
    let yearSelectorStartYear = Math.floor(currentCalendarDate.year() / 12) * 12;

    // محدودیت‌های تاریخی
    const today = new JalaliDate();
    const yesterday = today.subtract(1, "day");

    // عناصر jQuery
    const $openModalBtn = $("#filter_btn_date");
    const $datePickerModal = $("#datePickerModal");
    const $closeModalBtn = $("#closeModalBtn");
    const $confirmBtn = $("#confirmBtn");

    const $startDateBtn = $("#startDateBtn");
    const $endDateBtn = $("#endDateBtn");
    const $startDateText = $("#startDateText");
    const $endDateText = $("#endDateText");
    const $resetStartBtn = $("#resetStartBtn");
    const $resetEndBtn = $("#resetEndBtn");
    const $globalResetBtn = $("#globalResetBtn");
    const $selectedRange = $("#selectedRange");
    const $selectedStartDateSpan = $("#selectedStartDate");
    const $selectedEndDateSpan = $("#selectedEndDate");

    // عناصر تقویم
    const $calendarModal = $("#calendarModal");
    const $calendarTitle = $("#calendarTitle");
    const $currentMonthSpan = $("#currentMonth");
    const $currentYearSpan = $("#currentYear");
    const $calendarDays = $("#calendarDays");
    const $calendarWeekdays = $(".calendar-weekdays");
    const $prevMonthBtn = $("#prevMonth");
    const $nextMonthBtn = $("#nextMonth");
    const $calendarResetBtn = $("#calendarResetBtn");
    const $calendarCloseBtn = $("#calendarCloseBtn");

    // انتخابگر ماه و سال
    const $monthSelector = $("#monthSelector");
    const $monthGrid = $("#monthGrid");
    const $yearSelector = $("#yearSelector");
    const $yearRangeDisplay = $("#yearRangeDisplay");
    const $yearGrid = $("#yearGrid");
    const $prevYearPageBtn = $("#prevYearPage");
    const $nextYearPageBtn = $("#nextYearPage");

    // رویدادها
    $openModalBtn.on("click", openDatePickerModal);
    $closeModalBtn.on("click", closeDatePickerModal);
    $confirmBtn.on("click", confirmSelection);

    $startDateBtn.on("click", () => openCalendar("start"));
    $endDateBtn.on("click", () => openCalendar("end"));
    $resetStartBtn.on("click", () => resetDate("start"));
    $resetEndBtn.on("click", () => resetDate("end"));
    $globalResetBtn.on("click", resetAllDates);

    $prevMonthBtn.on("click", () => navigateMonth(-1));
    $nextMonthBtn.on("click", () => navigateMonth(1));
    $calendarResetBtn.on("click", resetCurrentCalendarDate);
    $calendarCloseBtn.on("click", closeCalendar);

    $currentMonthSpan.on("click", toggleMonthSelector);
    $currentYearSpan.on("click", toggleYearSelector);
    $prevYearPageBtn.on("click", () => navigateYearPage(-1));
    $nextYearPageBtn.on("click", () => navigateYearPage(1));

    // بستن مودال با کلیک خارج
    $(document).on("click", function (e) {
        if ($(e.target).is($datePickerModal)) {
            closeDatePickerModal();
        }
        if ($(e.target).is($calendarModal)) {
            closeCalendar();
        }
    });

    // کلید Esc برای بستن مودال‌ها
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            if (currentView === "months") toggleMonthSelector();
            else if (currentView === "years") toggleYearSelector();
            else if ($calendarModal.hasClass("show")) closeCalendar();
            else if ($datePickerModal.hasClass("show")) closeDatePickerModal();
        }
    });

    // توابع اصلی
    function openDatePickerModal() {
        $datePickerModal.addClass("show");
        $("body").css("overflow", "hidden");
    }

    function closeDatePickerModal() {
        $datePickerModal.removeClass("show");
        $("body").css("overflow", "");
    }

    function confirmSelection() {
        if (!selectedStartDate || !selectedEndDate) {
            showNotification("لطفاً هر دو تاریخ را انتخاب کنید!", "error");
            return;
        }

        if (selectedStartDate.isAfter(selectedEndDate)) {
            showNotification("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد!", "error");
            return;
        }

        if (selectedStartDate.isSame(selectedEndDate)) {
            showNotification("تاریخ شروع و پایان نمی‌توانند یکسان باشند!", "error");
            return;
        }

        closeDatePickerModal();
        sendDataToServer(selectedStartDate, selectedEndDate);
    }

    // ارسال داده به سرور
    function sendDataToServer(startDate, endDate) {
        // تبدیل به تاریخ میلادی
        const startGregorian = startDate.toGregorian();
        const endGregorian = endDate.toGregorian();

        // فرمت تاریخ میلادی
        function formatGregorianDate(date) {
            const year = date.gy;
            const month = String(date.gm).padStart(2, '0');
            const day = String(date.gd).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const dataToSend = {
            start_date: formatGregorianDate(startGregorian),
            end_date: formatGregorianDate(endGregorian),
            _token: $('meta[name="csrf-token"]').attr('content')
        };

        // تغییر وضعیت دکمه هنگام ارسال
        const originalBtnText = $confirmBtn.html();
        $confirmBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> در حال ارسال...');

        // ارسال درخواست AJAX
        $.ajax({
            url: 'https://webhook.site/190c266a-7748-4455-96d0-7fdd3c730fef', // آدرس API واقعی
            type: 'POST',
            dataType: 'json',
            data: dataToSend,
            success: function(response) {
                showNotification(
                    `تاریخ‌ها با موفقیت ارسال شدند!<br>
                    شروع: ${startDate.format()} | پایان: ${endDate.format()}`,
                    "success"
                );
                console.log('پاسخ سرور:', response);
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON?.message || "خطا در ارتباط با سرور";
                showNotification(errorMsg, "error");
                console.error('خطای ارسال:', xhr.responseJSON);
            },
            complete: function() {
                $confirmBtn.prop('disabled', false).html(originalBtnText);
            }
        });
    }

    function openCalendar(dateType) {
        currentDateType = dateType;
        currentView = "days";

        const selectedDate = dateType === "start" ? selectedStartDate : selectedEndDate;
        currentCalendarDate = selectedDate ? selectedDate.clone() : new JalaliDate();
        yearSelectorStartYear = Math.floor(currentCalendarDate.year() / 12) * 12;

        updateCalendarDisplay();
        $calendarModal.addClass("show");
    }

    function closeCalendar() {
        $calendarModal.removeClass("show");
        currentView = "days";
    }

    function navigateMonth(direction) {
        if (currentView !== "days") return;
        currentCalendarDate.add(direction, "month");
        updateCalendarDisplay();
    }

    function updateCalendarDisplay() {
        $currentMonthSpan.text(jalaliMonths[currentCalendarDate.month() - 1]);
        $currentYearSpan.text(currentCalendarDate.year());

        $monthSelector.removeClass("show").hide();
        $yearSelector.removeClass("show").hide();
        $calendarWeekdays.hide();
        $calendarDays.hide();

        switch (currentView) {
            case "days":
                $calendarWeekdays.show();
                $calendarDays.show();
                renderCalendarDays();
                break;
            case "months":
                $monthSelector.addClass("show").show();
                renderMonthSelector();
                break;
            case "years":
                $yearSelector.addClass("show").show();
                renderYearSelector();
                break;
        }
    }

    function renderCalendarDays() {
        $calendarDays.empty();
        const year = currentCalendarDate.year();
        const month = currentCalendarDate.month();
        const firstDay = new JalaliDate(year, month, 1);
        const startDayOfWeek = firstDay.getFirstDayOfMonth();
        const daysInMonth = firstDay.getDaysInMonth(year, month);

        for (let i = 0; i < startDayOfWeek; i++) {
            $calendarDays.append($("<div>").addClass("calendar-day other-month"));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new JalaliDate(year, month, day);
            const dayElement = $("<div>").addClass("calendar-day").text(day);

            const selectedDate = currentDateType === "start" ? selectedStartDate : selectedEndDate;
            if (selectedDate && dayDate.isSame(selectedDate)) {
                dayElement.addClass("selected");
            }

            if (dayDate.isSame(today)) {
                dayElement.addClass("today");
            }

            const maxDate = currentDateType === "start" ? yesterday : today;
            if (dayDate.isAfter(maxDate)) {
                dayElement.addClass("disabled");
            } else {
                dayElement.on("click", () => selectDate(new JalaliDate(year, month, day)));
            }

            $calendarDays.append(dayElement);
        }
    }

    function toggleMonthSelector() {
        currentView = currentView === "months" ? "days" : "months";
        updateCalendarDisplay();
    }

    function renderMonthSelector() {
        $monthGrid.empty();
        jalaliMonths.forEach((monthName, index) => {
            const monthElement = $("<div>")
                .addClass("month-item")
                .text(monthName)
                .toggleClass("selected", index + 1 === currentCalendarDate.month())
                .on("click", () => selectMonth(index + 1));
            $monthGrid.append(monthElement);
        });
    }

    function selectMonth(month) {
        currentCalendarDate = new JalaliDate(currentCalendarDate.year(), month, 1);
        currentView = "days";
        updateCalendarDisplay();
    }

    function toggleYearSelector() {
        currentView = currentView === "years" ? "days" : "years";
        updateCalendarDisplay();
    }

    function navigateYearPage(direction) {
        yearSelectorStartYear += direction * 12;
        renderYearSelector();
    }

    function renderYearSelector() {
        $yearRangeDisplay.text(`${yearSelectorStartYear} - ${yearSelectorStartYear + 11}`);
        $yearGrid.empty();

        for (let i = 0; i < 12; i++) {
            const year = yearSelectorStartYear + i;
            $yearGrid.append(
                $("<div>")
                    .addClass("year-item")
                    .text(year)
                    .toggleClass("selected", year === currentCalendarDate.year())
                    .on("click", () => selectYear(year))
            );
        }
    }

    function selectYear(year) {
        currentCalendarDate = new JalaliDate(year, currentCalendarDate.month(), 1);
        currentView = "days";
        updateCalendarDisplay();
    }

    function selectDate(selectedJalaliDate) {
        if (currentDateType === "start") {
            selectedStartDate = selectedJalaliDate;
        } else {
            selectedEndDate = selectedJalaliDate;
        }
        updateDateDisplay(currentDateType);
        updateSelectedRange();
        closeCalendar();
    }

    function updateDateDisplay(dateType) {
        const date = dateType === "start" ? selectedStartDate : selectedEndDate;
        const $textElement = dateType === "start" ? $startDateText : $endDateText;
        $textElement.text(date ? date.format() : (dateType === "start" ? "انتخاب تاریخ شروع" : "انتخاب تاریخ پایان"));
    }

    function resetDate(dateType) {
        if (dateType === "start") selectedStartDate = null;
        else selectedEndDate = null;
        updateDateDisplay(dateType);
        updateSelectedRange();
    }

    function resetAllDates() {
        selectedStartDate = null;
        selectedEndDate = null;
        updateDateDisplay("start");
        updateDateDisplay("end");
        updateSelectedRange();
    }

    function resetCurrentCalendarDate() {
        resetDate(currentDateType);
        renderCalendarDays();
    }

    function updateSelectedRange() {
        if (selectedStartDate && selectedEndDate) {
            $selectedStartDateSpan.text(selectedStartDate.format());
            $selectedEndDateSpan.text(selectedEndDate.format());
            $selectedRange.show();
        } else {
            $selectedRange.hide();
        }
    }

    // سیستم اطلاع‌رسانی
    function showNotification(message, type = "info") {
        const toasterId = "toast_" + Date.now();
        const iconClass = {
            success: "fa-check-circle",
            error: "fa-exclamation-circle",
            info: "fa-info-circle"
        }[type] || "fa-info-circle";

        const $toaster = $(`
            <div class="toaster-notification ${type}" id="${toasterId}">
                <div class="toaster-header">
                    <div class="toaster-title">
                        <i class="fas ${iconClass}"></i>
                        <span>${type === "success" ? "موفقیت" : type === "error" ? "خطا" : "اطلاع"}</span>
                    </div>
                    <button class="toaster-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="toaster-content">
                    <div class="toaster-message">${message}</div>
                </div>
                <div class="toaster-progress"></div>
            </div>
        `).appendTo("#toasterContainer");

        $toaster.find(".toaster-close").on("click", () => closeToaster(toasterId));
        
        setTimeout(() => $toaster.addClass("show"), 100);
        setTimeout(() => closeToaster(toasterId), 5000);
    }

    function closeToaster(toasterId) {
        const $toaster = $("#" + toasterId);
        $toaster.removeClass("show");
        setTimeout(() => $toaster.remove(), 400);
    }

    // مقداردهی اولیه
    updateDateDisplay("start");
    updateDateDisplay("end");
    updateSelectedRange();
});