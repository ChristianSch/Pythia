# Roadmap

## 0.1.0
### API
This shall be the first usable and presentable version of Pythia. The API
should be complete in the sense that all three resources, `Experiment`, `Model`,
`Measurements` should have complete CRUD methods. The API should be completely
set up with unit tests. Coverage testing should be part of the unit testing
process. All errors in the API should be handled.
The experiments as well as the models should be retrievable via the name to
make things easier. The measurements should be retrievable for only one metric,
hence allowing filtering via the api.

### Frontend
Resources should be creatable via the UI as well as deletable. The listing
should be exhaustive in the sense that all information that the model
potentially has should be presented. Filtering and sorting should be possible
on all applicable fields.
If several measurement points for any metric exist graphs should be shown
(by integrating Chart.js). It should be possible to sort models for an
experiment by the performance of one respective metric, or even more (yet
to be determined).
All frontend dependencies should be "batteries included". The frontend should
also utilize themes instead of deploying seperate html files with repeated
content for each view.
