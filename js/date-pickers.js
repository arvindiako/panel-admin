// Jalali Calendar Configuration
const jalaliMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];

// Simple Jalali Date Class
class JalaliDate {
    constructor(jy = null, jm = null, jd = null) {
        if (jy === null) {
            // Current date
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

    year() {
        return this.jy;
    }
    month() {
        return this.jm;
    }
    date() {
        return this.jd;
    }

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

            // Adjust day if needed
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
        return (date.getDay() + 1) % 7; // Convert to Persian week (Saturday = 0)
    }

    isSame(other) {
        return (
            this.jy === other.jy && this.jm === other.jm && this.jd === other.jd
        );
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
        return `${this.jd} / ${this.jm - 1} / ${this.jy}`;
    }
}

// Application State
let currentCalendarDate = new JalaliDate();
let selectedStartDate = null;
let selectedEndDate = null;
let currentDateType = null; // 'start' or 'end'
let currentView = "days"; // 'days', 'months', 'years' - NEW STATE
let yearSelectorStartYear = Math.floor(currentCalendarDate.year() / 12) * 12;

// Date limits
const today = new JalaliDate();
const yesterday = today.subtract(1, "day");

// jQuery Elements
const $openModalBtn = $("#filter_btn_date");
const $datePickerModal = $("#datePickerModal");
const $closeModalBtn = $("#closeModalBtn");
const $confirmBtn = $("#confirmBtn");

const $startDateBtn = $(".startDateBtn");
const $endDateBtn = $(".endDateBtn");
const $startDateText = $("#startDateText");
const $endDateText = $("#endDateText");
const $resetStartBtn = $("#resetStartBtn");
const $resetEndBtn = $("#resetEndBtn");
const $globalResetBtn = $("#globalResetBtn");
const $selectedRange = $("#selectedRange");
const $selectedStartDateSpan = $("#selectedStartDate");
const $selectedEndDateSpan = $("#selectedEndDate");

// Demo page elements
const $selectedDatesDisplay = $("#selectedDatesDisplay");
const $displayStartDate = $("#displayStartDate");
const $displayEndDate = $("#displayEndDate");

// Calendar Modal Elements
const $calendarModal = $(".calendarModal");
const $calendarTitle = $("#calendarTitle");
const $currentMonthSpan = $(".currentMonth");
const $currentYearSpan = $(".currentYear");
const $calendarDays = $(".calendarDays");
const $calendarWeekdays = $(".calendar-weekdays");
const $prevMonthBtn = $(".prevMonth");
const $nextMonthBtn = $(".nextMonth");
const $calendarResetBtn = $(".calendarResetBtn");
const $calendarCloseBtn = $(".calendarCloseBtn");

// Month Selector Elements
const $monthSelector = $(".monthSelector");
const $monthGrid = $(".monthGrid");

// Year Selector Elements
const $yearSelector = $(".yearSelector");
const $yearRangeDisplay = $(".yearRangeDisplay");
const $yearGrid = $(".yearGrid");
const $prevYearPageBtn = $(".prevYearPage");
const $nextYearPageBtn = $(".nextYearPage");

// Event Listeners
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

// Month and Year selector events - UPDATED LOGIC
$currentMonthSpan.on("click", toggleMonthSelector);
$currentYearSpan.on("click", toggleYearSelector);
$prevYearPageBtn.on("click", () => navigateYearPage(-1));
$nextYearPageBtn.on("click", () => navigateYearPage(1));

// Close modals when clicking outside
$datePickerModal.on("click", function (e) {
    if (
        $(e.target).is($datePickerModal) ||
        $(e.target).hasClass("modal-backdrop")
    ) {
        closeDatePickerModal();
    }
});

$calendarModal.on("click", function (e) {
    if ($(e.target).is($calendarModal)) {
        closeCalendar();
    }
});

// Escape key to close modals
$(document).on("keydown", function (e) {
    if (e.key === "Escape") {
        if (currentView === "months") {
            toggleMonthSelector();
        } else if (currentView === "years") {
            toggleYearSelector();
        } else if ($calendarModal.hasClass("show")) {
            closeCalendar();
        } else if ($datePickerModal.hasClass("show")) {
            closeDatePickerModal();
        }
    }
});

// Functions
function openDatePickerModal() {
    $datePickerModal.addClass("show");
    $("body").css("overflow", "hidden");
}

function closeDatePickerModal() {
    $datePickerModal.removeClass("show");
    $("body").css("overflow", "");
}

function confirmSelection() {
    if (selectedStartDate && selectedEndDate) {
        // Validate dates
        if (selectedStartDate.isAfter(selectedEndDate)) {
            showNotification(
                "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد!",
                "error"
            );
            return;
        }
        if (selectedStartDate.isSame(selectedEndDate)) {
            showNotification(
                "تاریخ شروع و پایان نمی‌توانند یکسان باشند!",
                "error"
            );
            return;
        }

        closeDatePickerModal();

        // Show unified toaster notification with date details
        showNotification("تاریخ‌ها با موفقیت انتخاب شدند!", "success", {
            showDates: true,
            startDate: selectedStartDate,
            endDate: selectedEndDate,
        });
    } else {
        showNotification("لطفاً هر دو تاریخ را انتخاب کنید!", "error");
    }
}

function openCalendar(dateType) {
    currentDateType = dateType;
    currentView = "days"; // Always start with days view

    // Set calendar to selected date or current date
    const selectedDate =
        dateType === "start" ? selectedStartDate : selectedEndDate;
    if (selectedDate) {
        currentCalendarDate = selectedDate.clone();
    } else {
        currentCalendarDate = new JalaliDate();
    }

    yearSelectorStartYear = Math.floor(currentCalendarDate.year() / 12) * 12;

    updateCalendarDisplay();
    $calendarModal.addClass("show");
}

function closeCalendar() {
    $calendarModal.removeClass("show");
    currentView = "days"; // Reset to days view
}

function navigateMonth(direction) {
    if (currentView !== "days") return; // Only work in days view
    currentCalendarDate.add(direction, "month");
    updateCalendarDisplay();
}

// UPDATED FUNCTION - Core logic for showing only current selection
function updateCalendarDisplay() {
    $currentMonthSpan.text(jalaliMonths[currentCalendarDate.month() - 1]);
    $currentYearSpan.text(currentCalendarDate.year());

    // Hide all sections first
    $monthSelector.removeClass("show").hide();
    $yearSelector.removeClass("show").hide();
    $calendarWeekdays.hide();
    $calendarDays.hide();

    // Show only the current view section
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

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = $("<div>").addClass("calendar-day other-month");
        $calendarDays.append(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new JalaliDate(year, month, day);
        const dayElement = $("<div>").addClass("calendar-day").text(day);

        // Check if this day is selected
        const selectedDate =
            currentDateType === "start" ? selectedStartDate : selectedEndDate;
        if (selectedDate && dayDate.isSame(selectedDate)) {
            dayElement.addClass("selected");
        }

        // Check if this is today
        if (dayDate.isSame(today)) {
            dayElement.addClass("today");
        }

        // Check if this day should be disabled
        const maxDate = currentDateType === "start" ? yesterday : today;
        if (dayDate.isAfter(maxDate)) {
            dayElement.addClass("disabled");
        } else {
            dayElement.on("click", function () {
                selectDate(new JalaliDate(year, month, day));
            });
        }

        $calendarDays.append(dayElement);
    }
}

// UPDATED FUNCTION - Toggle between months view and days view
function toggleMonthSelector() {
    if (currentView === "months") {
        currentView = "days";
    } else {
        currentView = "months";
    }
    updateCalendarDisplay();
}

function renderMonthSelector() {
    $monthGrid.empty();

    jalaliMonths.forEach((monthName, index) => {
        const monthElement = $("<div>").addClass("month-item").text(monthName);

        if (index + 1 === currentCalendarDate.month()) {
            monthElement.addClass("selected");
        }

        monthElement.on("click", function () {
            selectMonth(index + 1);
        });

        $monthGrid.append(monthElement);
    });
}

function selectMonth(month) {
    currentCalendarDate = new JalaliDate(currentCalendarDate.year(), month, 1);
    currentView = "days"; // Return to days view after selection
    updateCalendarDisplay();
}

// UPDATED FUNCTION - Toggle between years view and days view
function toggleYearSelector() {
    if (currentView === "years") {
        currentView = "days";
    } else {
        currentView = "years";
    }
    updateCalendarDisplay();
}

function navigateYearPage(direction) {
    yearSelectorStartYear += direction * 12;
    renderYearSelector();
}

function renderYearSelector() {
    $yearRangeDisplay.text(
        `${yearSelectorStartYear} - ${yearSelectorStartYear + 11}`
    );
    $yearGrid.empty();

    for (let i = 0; i < 12; i++) {
        const year = yearSelectorStartYear + i;
        const yearElement = $("<div>").addClass("year-item").text(year);

        if (year === currentCalendarDate.year()) {
            yearElement.addClass("selected");
        }

        yearElement.on("click", function () {
            selectYear(year);
        });

        $yearGrid.append(yearElement);
    }
}

function selectYear(year) {
    currentCalendarDate = new JalaliDate(year, currentCalendarDate.month(), 1);
    currentView = "days"; // Return to days view after selection
    updateCalendarDisplay();
}

function selectDate(selectedJalaliDate) {
    if (currentDateType === "start") {
        selectedStartDate = selectedJalaliDate;
        updateDateDisplay("start");
    } else {
        selectedEndDate = selectedJalaliDate;
        updateDateDisplay("end");
    }

    updateSelectedRange();
    closeCalendar();
}

function updateDateDisplay(dateType) {
    const date = dateType === "start" ? selectedStartDate : selectedEndDate;
    const $textElement = dateType === "start" ? $startDateText : $endDateText;

    if (date) {
        $textElement.text(date.format());
    } else {
        $textElement.text(
            dateType === "start" ? "انتخاب تاریخ شروع" : "انتخاب تاریخ پایان"
        );
    }
}

function resetDate(dateType) {
    if (dateType === "start") {
        selectedStartDate = null;
        updateDateDisplay("start");
    } else {
        selectedEndDate = null;
        updateDateDisplay("end");
    }

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
    if (currentDateType === "start") {
        selectedStartDate = null;
        updateDateDisplay("start");
    } else {
        selectedEndDate = null;
        updateDateDisplay("end");
    }

    updateSelectedRange();
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

// Notification system
function showNotification(message, type = "info", options = {}) {
   const toasterId = "toast_" + Date.now() + "_" + Math.floor(Math.random() * 10000);


    // Create notification content
    let toasterContent = "";

    // Add main message
    if (!options.showDates) {
        toasterContent = `
                        <div class="toaster-content">
                            <div class="toaster-message">${message}</div>
                        </div>
                    `;
    } else {
        // Extended content with dates
        toasterContent = `
                        <div class="toaster-content">
                            <div class="toaster-message">${message}</div>
                            <div class="toaster-date-item">
                                <span class="toaster-date-label">تاریخ شروع:</span>
                                <span class="toaster-date-value">${options.startDate.format()}</span>
                            </div>
                            <div class="toaster-date-item">
                                <span class="toaster-date-label">تاریخ پایان:</span>
                                <span class="toaster-date-value">${options.endDate.format()}</span>
                            </div>
                        </div>
                    `;
    }

    const iconClass =
        type === "success"
            ? "fa-check-circle"
            : type === "error"
            ? "fa-exclamation-circle"
            : "fa-info-circle";

    const $toaster = $(`
                    <div class="toaster-notification ${type} ${
        options.showDates ? "extended" : ""
    }" id="${toasterId}">
                        <div class="toaster-header">
                            <div class="toaster-title">
                                <i class="fas ${iconClass}"></i>
                                <span>${
                                    type === "success"
                                        ? "موفقیت"
                                        : type === "error"
                                        ? "خطا"
                                        : "اطلاع"
                                }</span>
                            </div>
                            <button class="toaster-close" onclick="closeToaster('${toasterId}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        ${toasterContent}
                        <div class="toaster-progress"></div>
                    </div>
                `);

    $("#toasterContainer").append($toaster);

    // Show toaster with animation
    setTimeout(() => {
        $toaster.addClass("show");
    }, 100);

    // Auto close duration (longer for extended notifications)
    const hideDelay = options.showDates ? 6000 : 4000;

    // Auto close after delay
    setTimeout(() => {
        closeToaster(toasterId);
    }, hideDelay);
}

// Close specific toaster
function closeToaster(toasterId) {
    const $toaster = $(`#${toasterId}`);
    $toaster.removeClass("show");

    setTimeout(() => {
        $toaster.remove();
    }, 400);
}

// Make closeToaster globally accessible
window.closeToaster = closeToaster;

// Initialize the application
updateDateDisplay("start");
updateDateDisplay("end");
updateSelectedRange();
