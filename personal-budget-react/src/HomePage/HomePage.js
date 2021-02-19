import React from "react";

import axios from "axios";
import Chart from "chart.js";
import createD3DonutChart from "./d3.chart";
import randomColor from "randomcolor";

class HomePage extends React.Component {

  render() {
    return(
        <main className="container center" id="maincontent">
        <section className="page-area">
            <article className="text-box">
            <h1>Stay on track</h1>
            <p>
                Do you know where you are spending your money? If you really stop to
                track it down, you would get surprised! Proper budget management
                depends on real data... and this app will help you with that!
            </p>
            </article>

            <article className="text-box">
            <h1>Alerts</h1>
            <p>
                What if your clothing budget ended? You will get an alert. The goal
                is to never go over the budget.
            </p>
            </article>

            <article className="text-box">
            <h1>Results</h1>
            <p>
                People who stick to a financial plan, budgeting every expense, get
                out of debt faster! Also, they to live happier lives... since they
                expend without guilt or fear... because they know it is all good and
                accounted for.
            </p>
            </article>

            <article className="text-box">
            <h1>Free</h1>
            <p>This app is free!!! And you are the only one holding your data!</p>
            </article>

            <article className="text-box">
            <h1>Stay on track</h1>
            <p>
                Do you know where you are spending your money? If you really stop to
                track it down, you would get surprised! Proper budget management
                depends on real data... and this app will help you with that!
            </p>
            </article>

            <article className="text-box">
            <h1>Alerts</h1>
            <p>
                What if your clothing budget ended? You will get an alert. The goal
                is to never go over the budget.
            </p>
            </article>

            <article className="text-box d3">
            <h1>D3.js Chart</h1>
            <p></p>
            </article>

            <article className="text-box">
            <h1>Chart.js Chart</h1>
            <p>
                <canvas id="myChart" width="400" height="400"></canvas>
            </p>
            </article>
        </section>
        </main>
    );
  }

  componentDidMount() {
    loadCharts(this.props);
  }

}


function loadCharts(props) {
  if (props.dataSource.datasets[0].data.length === 0) {
    // Fetch and save data
    getBudget(props);
  } else {
    // Use existing data
    createCharts(props.dataSource);
  }
}

function createChartjsChart(inputData) {
  const ctx = document.getElementById("myChart");
  new Chart(ctx, {
    type: "pie",
    data: inputData,
  });
}

function createCharts(dataSource) {
  createChartjsChart(dataSource);
  createD3DonutChart(dataSource);
}

function getBudget(props) {
  axios.get("http://localhost:3000/budget").then((res) => {
    let newData = props.dataSource;
    res.data.myBudget.forEach((obj, index) => {
      newData.datasets[0].data[index] = obj.budget;
      newData.datasets[0].backgroundColor[index] = randomColor();
      newData.labels[index] = obj.title;
    });
    createCharts(newData);
    props.handleCharts(newData);
  });
}

export default HomePage;
