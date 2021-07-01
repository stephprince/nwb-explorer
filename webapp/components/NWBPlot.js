import React from 'react';
import PlotComponent from '@geppettoengine/geppetto-ui/plot/PlotComponent';

import ExternalInstance from '@geppettoengine/geppetto-core/model/ExternalInstance';

export default class NWBTimeseriesPlotComponent extends React.Component {

  getLegendName (projectId, experimentId, instance, sameProject) {
    const instancePath = instance.getInstancePath()
      .split('.')
      .filter((word, index, arr) => index != 0 && index != arr.length - 1)
      .join('.')

    if (sameProject) {
      window.Project.getExperiments().forEach(experiment => {
        if (experiment.id == experimentId) {
          return `${instancePath} [${experiment.name}]`;
        }
      })
    } else {
      GEPPETTO.ProjectsController.getUserProjects().forEach(project => {
        if (project.id == projectId) {
          project.experiments.forEach(experiment => {
            if (experiment == experimentId) {
              return `${instancePath} [${project.name} - ${experiment.name}]`;
            }
          })
        }
      })
    }
  }
  
  extractLegendName (instanceY) {
    let legendName = instanceY.getInstancePath()
      .split('.')
      .filter((word, index, arr) => index != 0 && index != arr.length - 1)
      .join('.')

    if (instanceY instanceof ExternalInstance) {
      legendName = this.getLegendName(instanceY.projectId, instanceY.experimentId, instanceY, window.Project.getId() == instanceY.projectId);
    }  
    return legendName
  }

  getInstanceData (instanceY, instanceX, lineOptions, mode) {
    let legendName = this.extractLegendName(instanceY);
    let instanceXValues = instanceX.getTimeSeries()
    let instanceYValues = instanceY.getTimeSeries()

    // in case of 2D spatial series, plot data values against each other
    const TimeSeriesType = instanceY.getVariable().getParent().getName() // TODO - this should probably happen elsewhere but leaving here for now
    if (TimeSeriesType == 'SpatialSeries') {
      if (Array.isArray(instanceYValues[0])) { // could also do something like instanceYValues.length == 2 but not good for case of array length 2
        instanceXValues = instanceYValues[0]
        instanceYValues = instanceYValues[1]
      }
    }

    const trace = {
      ...this.getSinglePlotConfiguration(lineOptions, mode),
      x: instanceXValues,
      y: instanceYValues,
      path: instanceY.getInstancePath(),
      name: legendName,
    };

    return trace;
  }

  render () {
    const { instancePaths, key } = this.props;


    const plots = instancePaths.map(instancePath => ({
      x: `${instancePath}.timestamps`, // TODO - fix this so that accurately maps unit values in both time series and spatial series cases
      y: `${instancePath}.data`,
      lineOptions: { color: this.props.modelSettings[instancePath].color }
    }));
    console.log('Plots:', plots)


    return (
      <PlotComponent
        id={key}
        plots={plots}
        extractLegendName={this.extractLegendName}
        getInstanceData={this.getInstanceData}
      />
    )
  }
}