// Examples for index.html
//
// This is a reference file with custom chart functions and addons. 
//
// Part A: Chart examples (1 to 3)
//   Copy ONE drawChart function and paste it over the drawChart function
//   in index.html (step 4). Save and refresh the browser.
//
// Part B: Add-ons (4 and 5)
//   These are not charts. They are plain HTML, CSS and JavaScript.
//   Each one lists the small edits to make in index.html.
//
// The examples use these variables that already exist in index.html:
//   shown      locations up to the slider date
//   cutoff     the slider date
//   animals    list of animal ids
//   colorOf    animal id -> color
//   firstTime, lastTime    start and end of the tracking period
//   CONFIG     the settings at the top of the script


// ---------------------------------------------------------------------
// Example 1: Line chart (the chart that comes with index.html)
// ---------------------------------------------------------------------
function drawChart(shown, cutoff) {
  if (chart) chart.destroy();

  chart = new Chart($("chart"), {
    type: "scatter",
    data: {
      datasets: animals.map(id => ({
        label: id,
        data: shown.filter(p => p.id === id).map(p => ({ x: p.time, y: p.value })),
        borderColor: colorOf[id],
        backgroundColor: colorOf[id],
        showLine: true,
        pointRadius: 1.5
      }))
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          type: "linear",
          min: firstTime,
          max: lastTime,
          ticks: { maxTicksLimit: 6, callback: time => formatDate(time).slice(0, 7) }
        },
        y: { title: { display: true, text: CONFIG.valueLabel } }
      }
    }
  });
}


// ---------------------------------------------------------------------
// Example 2: Pie chart
// Each slice is the number of locations recorded for one animal.
// Change type to "doughnut" for a ring instead of a full pie.
// ---------------------------------------------------------------------
function drawChart(shown, cutoff) {
  if (chart) chart.destroy();

  chart = new Chart($("chart"), {
    type: "pie",
    data: {
      labels: animals,
      datasets: [{
        data: animals.map(id => shown.filter(p => p.id === id).length),
        backgroundColor: animals.map(id => colorOf[id])
      }]
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } }
    }
  });
}


// ---------------------------------------------------------------------
// Example 3: Gauge
// A half doughnut with two slices: the part of the tracking period
// shown so far, and the part that is left.
// ---------------------------------------------------------------------
function drawChart(shown, cutoff) {
  if (chart) chart.destroy();

  const percent = (cutoff - firstTime) / (lastTime - firstTime) * 100;

  chart = new Chart($("chart"), {
    type: "doughnut",
    data: {
      labels: ["Shown", "Remaining"],
      datasets: [{
        data: [percent, 100 - percent],
        backgroundColor: ["#1b9e77", "#e3e6e5"]
      }]
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      circumference: 180,   // half circle
      rotation: -90,        // start on the left
      cutout: "70%",
      plugins: {
        legend: { display: false },
        title: { display: true, text: Math.round(percent) + "% of the tracking period shown" }
      }
    }
  });
}


// =====================================================================
// PART B: ADD-ONS
// =====================================================================


// ---------------------------------------------------------------------
// Example 4: Animal dropdown
// Lets the viewer show one animal or all animals. The map and the chart
// both update because they only draw the locations in "shown".
// ---------------------------------------------------------------------

// Edit 1, HTML: add this inside <aside>, above the slider label
//
//   <label for="animal">Animal</label>
//   <select id="animal"></select>

// Edit 2, CSS: in <style>, replace the line  input { width: 100%; }  with
//
//   input, select { width: 100%; }
//   select { margin-bottom: 0.5rem; }

// Edit 3, JavaScript: add these lines at the end of setupPage()
$("animal").innerHTML = '<option value="all">All animals</option>' +
  animals.map(id => `<option>${id}</option>`).join("");
$("animal").addEventListener("change", update);

// Edit 4, JavaScript: in update(), replace the line that creates "shown"
const animal = $("animal").value;
const shown = points.filter(p => p.time <= cutoff && (animal === "all" || p.id === animal));


// ---------------------------------------------------------------------
// Example 5: Indicator cards
// Three big numbers that change as the slider moves.
// ---------------------------------------------------------------------

// Edit 1, HTML: in <aside>, replace the line
//   <p><span id="count">0</span> locations shown</p>
// with
//
//   <div class="cards">
//     <div class="card"><strong id="count">0</strong>locations</div>
//     <div class="card"><strong id="animalCount">0</strong>animals</div>
//     <div class="card"><strong id="average">0</strong>average value</div>
//   </div>

// Edit 2, CSS: add these rules inside <style>
//
//   .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
//   .card { padding: 0.5rem; border: 1px solid #ccc; text-align: center; font-size: 0.8rem; }
//   .card strong { display: block; font-size: 1.5rem; }

// Edit 3, JavaScript: in update(), add these lines before drawChart(shown, cutoff).
// The "count" line already exists, so only add the other two.
const animalsShown = new Set(shown.map(p => p.id));
$("animalCount").textContent = animalsShown.size;

const total = shown.reduce((sum, p) => sum + p.value, 0);
$("average").textContent = shown.length ? (total / shown.length).toFixed(1) : "n/a";
