# Deployed with Vercel: https://dasboard-wheat.vercel.app/
## Presentation: https://docs.google.com/presentation/d/1ribVZxSTARonfi6WzcOFpkNzVWb4j43YV0KIksNCUQQ/edit?usp=sharing
# Essential Question
* How has inflation impacted housing prices in different U.S. States over the past decade?
* Theory: If the inflation rate increases then the housing prices would also increase.

## Visualization
* Inflation Rate Changes Over Time (Line Chart):
  * Displays the trend in inflation rates over the years for each selected state.
  * Each line represents a state; hovering reveals the precise inflation rate for that year.

* Relationship Between Housing Prices and Inflation (Scatter Plot):
  * Illustrates the correlation between housing prices (HPI) and inflation rates.
  * Each point corresponds to a specific year in a state; hover details show HPI and inflation values.

* Housing Price Index Heat Map:
  * Presents a color-coded grid of HPI values across states (x-axis) and years (y-axis).
  * Darker colors denote higher HPI; hovering over a cell reveals the exact HPI value.

* Average Housing Price Index by State (Bar Chart):
  * Ranks states based on their average HPI over the selected period.
  * Bars display average HPI values via hover tooltips, enabling easy comparison across states


## Data Sources

To analyze the relationship between inflation and housing prices, I am using the following datasets:

1. Federal Housing Finance Agency (FHFA) House Price Index (HPI):

* [Dataset Link](https://www.fhfa.gov/data/hpi/datasets?utm_source=chatgpt.com)

  * Measures changes in housing prices across the U.S., helping us track how home values have evolved over time.

2. U.S. Bureau of Labor Statistics (BLS) Consumer Price Index (CPI-U)

* [West Region CPI Data](https://www.bls.gov/regions/west/factsheet/consumer-price-index-data-tables.htm?utm_source=chatgpt.com)

3. Freddie Mac House Price Index (FMHPI)

* [Dataset Link](https://www.freddiemac.com/research/indices/house-price-index?utm_source=chatgpt.com)

  * Another measure of home price changes that complements the FHFA HPI data.
  
## How These Datasets Answer the Question

* CPI Data shows how inflation has fluctuated in different states, giving us insight into cost-of-living increases.

* HPI and FMHPI Data track housing price changes, revealing how much home values have increased over time.
  
* By comparing inflation rates with housing price growth, we can determine whether housing prices have outpaced inflation and assess affordability trends.
