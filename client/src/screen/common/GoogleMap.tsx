import {
  AdvancedMarker,
  APIProvider,
  Map,
  Marker,
  Pin
} from '@vis.gl/react-google-maps';

const API_KEY =
  'AIzaSyBAenBGKjoyyltFgnLDK_HXt7tHjHaYEs8';

const GoogleMap = () => {
  return (
    <APIProvider apiKey={API_KEY} libraries={['marker']}>
      <Map
        mapId={'bf51a910020fa25a'}
        defaultZoom={10}
        defaultCenter={{lat: 50.94187217556429, lng: 10.396446000124373}}
        gestureHandling={'greedy'}
        disableDefaultUI
      >
        <Marker
          position={{lat: 50, lng: 10}}
          clickable={true}
          onClick={() => alert('marker was clicked!')}
          title={'clickable google.maps.Marker'}
        />

        {/* advanced marker with customized pin */}
        <AdvancedMarker
          position={{lat: 51, lng: 11}}
          title={'AdvancedMarker with customized pin.'}>
          <Pin
            background={'#22ccff'}
            borderColor={'#1e89a1'}
            glyphColor={'#0f677a'}></Pin>
        </AdvancedMarker>

        {/* advanced marker with html pin glyph */}
        <AdvancedMarker
          position={{lat: 51, lng: 10}}
          title={'AdvancedMarker with customized pin.'}>
          <Pin background={'#22ccff'} borderColor={'#1e89a1'} scale={1.4}>
            {/* children are rendered as 'glyph' of pin */}
            👀
          </Pin>
        </AdvancedMarker>

        {/* advanced marker with html-content */}
        <AdvancedMarker
          position={{lat: 50, lng: 11}}
          title={'AdvancedMarker with custom html content.'}
          onClick={() => alert('테스트 클릭')}
        >
            <div style={{
              padding: '5px 10px',
              background: '#1dbe80',
              border: '2px solid #333',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
            }}>
              <p>테스트</p>
            </div>
        </AdvancedMarker>

     
      </Map>

      {/* <ControlPanel /> */}
    </APIProvider>
  );
};

export default GoogleMap;
