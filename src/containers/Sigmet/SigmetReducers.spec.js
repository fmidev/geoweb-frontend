import dispatch from './SigmetReducers';
import { LOCAL_ACTIONS, CATEGORY_REFS, SIGMET_MODES } from './SigmetActions';
import produce from 'immer';
import moxios from 'moxios';

describe('(Reducer) Sigmet/SigmetReducers', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('should be a function', () => {
    expect(dispatch).to.be.a('function');
  });
  it('should handle toggleContainer', (done) => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        isContainerOpen: false
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.toggleContainerAction(null), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('isContainerOpen', true);
    dispatch(LOCAL_ACTIONS.toggleContainerAction(null), container);
    expect(container.state).to.have.property('isContainerOpen', false);
    done();
  });
  it('should handle toggleCategory', (done) => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        focussedSigmet: {
          uuid: null,
          mode: SIGMET_MODES.READ
        },
        focussedCategoryRef: CATEGORY_REFS.CONCEPT_SIGMETS
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.toggleCategoryAction(null, CATEGORY_REFS.ADD_SIGMET), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('focussedCategoryRef', CATEGORY_REFS.ADD_SIGMET);
    expect(container.state).to.have.property('focussedSigmet');
    expect(container.state.focussedSigmet).to.be.a('object');
    expect(container.state.focussedSigmet).to.have.property('uuid', null);
    expect(container.state.focussedSigmet).to.have.property('mode', SIGMET_MODES.EDIT);
    dispatch(LOCAL_ACTIONS.toggleCategoryAction(null, CATEGORY_REFS.ACTIVE_SIGMETS), container);
    expect(container.state).to.have.property('focussedCategoryRef', CATEGORY_REFS.ACTIVE_SIGMETS);
    dispatch(LOCAL_ACTIONS.toggleCategoryAction(null, CATEGORY_REFS.ACTIVE_SIGMETS), container);
    expect(container.state).to.have.property('focussedCategoryRef', null);
    done();
  });
  it('should handle retrieveParameters', (done) => {
    const parameters = {
      'maxhoursofvalidity': 4.0,
      'hoursbeforevalidity': 4.0,
      'firareas': [{ 'location_indicator_icao': 'EHAA', 'firname': 'FIR AMSTERDAM', 'areapreset': 'NL_FIR' }],
      'location_indicator_wmo': 'EHDB'
    };
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        parameters: {}
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.retrieveParametersAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: parameters
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state).to.have.property('parameters');
        expect(container.state.parameters).to.have.property('maxhoursofvalidity', 4.0);
        expect(container.state.parameters).to.have.property('hoursbeforevalidity', 4.0);
        expect(container.state.parameters).to.have.property('location_indicator_wmo', 'EHDB');
        expect(container.state.parameters).to.have.property('firareas');
        expect(container.state.parameters.firareas).to.eql(parameters.firareas);
        done();
      }).catch(done);
    });
  });
  it('should handle retrievePhenomena', (done) => {
    const phenomena = [{
      'phenomenon': {
        'name': 'Thunderstorm',
        'code': 'TS',
        'layerpreset': 'sigmet_layer_TS'
      },
      'variants': [{ 'name': 'Obscured', 'code': 'OBSC' }, { 'name': 'Embedded', 'code': 'EMBD' }],
      'additions': [{ 'name': 'with hail', 'code': 'GR' }]
    }];
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        phenomena: []
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.retrievePhenomenaAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: phenomena
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state).to.have.property('phenomena');
        expect(container.state.phenomena).to.eql([
          {
            'code': 'OBSC_TSGR',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Obscured thunderstorm with hail'
          },
          {
            'code': 'OBSC_TS',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Obscured thunderstorm'
          },
          {
            'code': 'EMBD_TSGR',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Embedded thunderstorm with hail'
          },
          {
            'code': 'EMBD_TS',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Embedded thunderstorm'
          }
        ]);
        done();
      }).catch(done);
    });
  });
  it('should handle addSigmet', (done) => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        },
        drawActions: {
          setGeoJSON: () => {}
        },
        dispatch: () => {}
      },
      state: {
        phenomena: [{
          'code': 'OBSC_TSGR',
          'layerpreset': 'sigmet_layer_TS',
          'name': 'Obscured thunderstorm with hail'
        }],
        parameters: {
          'maxhoursofvalidity': 4.0,
          'hoursbeforevalidity': 4.0,
          'firareas': [{ 'location_indicator_icao': 'EHAA', 'firname': 'FIR AMSTERDAM', 'areapreset': 'NL_FIR' }],
          'location_indicator_wmo': 'EHDB'
        },
        firs: {},
        categories: [{
          ref: CATEGORY_REFS.ADD_SIGMET,
          sigmets: [{ test: null }, { test: null }]
        }]
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('categories');
    expect(container.state.categories).to.have.length(1);
    expect(container.state.categories[0]).to.have.property('sigmets');
    expect(container.state.categories[0].sigmets).to.have.length(2);
    dispatch(LOCAL_ACTIONS.addSigmetAction(CATEGORY_REFS.ADD_SIGMET), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('categories');
    expect(container.state.categories).to.have.length(1);
    expect(container.state.categories[0]).to.have.property('sigmets');
    expect(container.state.categories[0].sigmets).to.have.length(1);
    done();
  });
  it('should handle retrieveSigmets', (done) => {
    const sigmet = {
      'geojson': {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'properties': { 'selectionType': 'box', 'featureFunction': 'start', 'stroke-width': 0.8, 'fill': '#0f0', 'fill-opacity': 0.2 },
          'geometry': { 'type': 'Polygon', 'coordinates': [[[2.84, 52.18], [2.84, 50.36], [7.92, 50.36], [7.92, 52.18], [2.84, 52.18], [2.84, 52.18]]] },
          'id': '5eb7877c-ddab-4f8a-a419-c7051d5b4af8'
        }]
      },
      'phenomenon': 'SQL_TSGR',
      'obs_or_forecast': { 'obs': true },
      'levelinfo': { 'levels': [{ 'value': 0, 'unit': 'FL' }, { 'value': 1, 'unit': 'M' }], 'mode': 'AT' },
      'movement': { 'stationary': true },
      'change': 'WKN',
      'validdate': '2018-07-16T16:00:00Z',
      'validdate_end': '2018-07-16T20:00:00Z',
      'firname': 'FIR AMSTERDAM',
      'location_indicator_icao': 'EHAA',
      'location_indicator_mwo': 'EHDB',
      'uuid': '8918a112-5e75-4e74-983e-ce33b3b8d8a2',
      'status': 'concept',
      'sequence': -1
    };
    const sigmetsResponse = {
      'sigmets': [sigmet]
    };
    const resultSigmet = produce(sigmet, draftState => {
      draftState.geojson.features[0].properties.relatesTo = null;
      draftState.geojson.features[0].properties.stroke = null;
      draftState.geojson.features[0].properties['stroke-opacity'] = null;
      draftState.forecast_position_time = null;
      draftState.issuedate = null;
      draftState.movement.dir = null;
      draftState.movement.speed = null;
      draftState.obs_or_forecast.obsFcTime = null;
    });
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        categories: [
          { ref: CATEGORY_REFS.ACTIVE_SIGMETS, sigmets: [] },
          { ref: CATEGORY_REFS.CONCEPT_SIGMETS, sigmets: [] },
          { ref: CATEGORY_REFS.ADD_SIGMET, sigmets: [] },
          { ref: CATEGORY_REFS.ARCHIVED_SIGMETS, sigmets: [] }
        ]
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.retrieveSigmetsAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: sigmetsResponse
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state).to.have.property('categories');
        expect(container.state.categories).to.be.a('array');
        expect(container.state.categories).to.have.length(4);
        expect(container.state.categories[3]).to.have.property('sigmets');
        expect(container.state.categories[3].sigmets).to.eql([resultSigmet]);
        done();
      }).catch(done);
    });
  });
});
