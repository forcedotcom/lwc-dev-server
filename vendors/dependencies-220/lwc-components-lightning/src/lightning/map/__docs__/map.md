---
examples:
 - name: singleMarker
   label: Map with a Single Marker
   description: A map can display a single marker with default centering and zoom.
 - name: multipleMarkers
   label: Map with Multiple Markers
   description: A map with multiple markers includes the list of locations next to the map.
 - name: complexExample
   label: Map with Manual Centering and Zoom
   description: A map can include custom configurations such as optional icons, and manual centering and zoom.
---
A `lightning-map` component displays a map of one or more locations, using geocoding data and mapping imagery from Google Maps.
The map image is shown in a container, with an optional list of the locations. The list is visible by default when there are multiple locations specified. When you select a location title in the list, its map marker is activated. The list is shown beside or below the map, depending on the width of the container.

`lightning-map` loads content from the Salesforce domain `maps.a.forceusercontent.com` in an iframe. You must whitelist `maps.a.forceusercontent.com` if you want to use this component in your own domain and you use the Content Security Policy `frame-src` directive, such as in Lightning Communities or Lightning Out. For more information, see [Content Security Policy in Lightning Communities](https://help.salesforce.com/articleView?id=networks_security_csp_overview.htm).

This component inherits styling from [map](https://www.lightningdesignsystem.com/components/map/) in the
Lightning Design System.

Pass the locations to be displayed via the component's `map-markers` property.

For example:

```html
<template>
    <lightning-map
	    map-markers={mapMarkers}>
    </lightning-map>
</template>
```

`map-markers` is an array of markers that indicate location.

A marker contains
- Location Information: A coordinate pair of latitude and longitude, or an address composed of address elements.
- Descriptive Information: Optional title, description, and an icon. These are relevant to the marker but not specifically related to location.

#### Marker Properties

Use the following marker properties to customize the map display.

Property|Type|Description
-----|-----|-----
location|object|Address elements (City, Country, PostalCode, State, and Street) or a set of latitude and longitude coordinates. If you specify address elements and coordinates for one location, the map uses the coordinates. To support reliable geocoding of addresses, if you specify Street, you must also specify at least one of City, Country, PostalCode or State.
title|string|The location title for the marker, displayed in the location list and in the info window when you click a marker.
description|string|The information displayed in the info window when you click a marker or location title.
icon|string|The icon that's displayed next to the location title in the list. Only Lightning Design System icons are supported. Custom marker icons are currently not supported. The default is standard:location. For more information, see Displaying Multiple Addresses.


#### Displaying a Single Marker

Here's an example of a marker that uses address elements.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
mapMarkers = [{
    location: {
        City: 'San Francisco',
        Country: 'USA',
        PostalCode: '94105',
        State: 'CA',
        Street: 'The Landmark @ One Market, Suite 300'
    },
    title: 'The Landmark Building',
    description: 'The Landmark is considered to be one of the city's most architecturally distinct and historic properties',
    icon: 'standard:account'
}];
}
```

Here's an example of a marker that uses coordinates for latitude and longitude.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
mapMarkers = [{
    location: {
        Latitude: '37.790197',
        Longitude: '-122.396879'
    }
}];
}
```
For each map marker in the array of map markers, provide either latitude and longitude coordinates or address elements. If you specify both in a single marker, latitude and longitude gets precedence.

#### Displaying Multiple Addresses and a Title

When you specify multiple markers in an array, the `lightning-map` component renders a list of tiles with location titles and addresses, with a heading displayed above the list. Each location tile contains an icon, a title, and an address.

Specify the `markers-title` attribute to display a custom heading for your locations. If you don't pass this attribute, the heading is "Markers(n)" where n is the number of markers you provide.

```html
<template>
    <lightning-map
	map-markers={mapMarkers}
	markers-title="My favorite places for lunch">
  </lightning-map>
</template>
```

To customize each location tile, you can specify the optional `icon`, `title`, and `description` properties. The `lightning-map` component displays the icon next to the address. The description is displayed in an info window when the user clicks the marker.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                // Location Information
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '50 Fremont St',
            },

            // Extra info for tile in list & info window
            icon: 'standard:account',
            title: 'Julies Kitchen', // e.g. Account.Name
            description: 'This is a long description',
        },
        {
            location: {
                // Location Information
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '30 Fremont St.',
            },

            // Extra info for tile in list
            icon: 'standard:account',
            title: 'Tender Greens', // e.g. Account.Name
        },
    ];
}
```

#### Displaying or Hiding the List of Locations

By default, the list of locations is hidden when you pass in a single marker and displayed when you pass in multiple markers. To hide the list of locations for multiple markers, set `list-view="hidden"`. To display the list of locations for a single marker, set `list-view="visible"`.

The example for specifying `zoom-level` also uses `list-view`.


#### Specifying Zoom Level

If you don't specify the `zoom-level` attribute, the `lightning-map` component calculates a zoom level to accommodate the markers in your map.

To specify a particular zoom level, set `zoom-level` to a value corresponding to a Google Maps API zoom level. Currently, Google Maps API supports zoom levels from `1` to `22` in desktop browsers, and from `1` to `20` on mobile. For more information, see [Zoom Levels](https://developers.google.com/maps/documentation/javascript/tutorial#zoom-levels) in the Google Maps API documentation.

Here's an example that uses `zoom-level` and `list-view` attributes.

```html
<template>
    <lightning-map
	    map-markers={mapMarkers}
        zoom-level={zoomLevel}
        list-view={listView}>
   </lightning-map>
</template>
```

The component's JavaScript sets the markers, zoom level, and list view visibility.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                Street: '1000 5th Ave',
                City: 'New York',
                State: 'NY',
            },

            title: 'Museum of Fine Arts',
            description:
                'A grand setting for one of the greatest collections of art, from ancient to contemporary.',
        },
    ];
        zoomLevel = 15;
        listView = 'visible';
}
```

#### Centering the Map

When you have multiple map markers, the component centers the map on a location near the center of the markers.

Use the `center` attribute to specify a different location for the map's center. You can specify latitude and longitude, or at least one of the address elements: Country, State, City, and PostalCode. Street is optional.

The `center` location format is the same as the `map-markers` location format. However, you can't specify a title, icon, or description for the center.

Here's an example that centers the map using latitude and longitude.

```html
<template>
    <lightning-map
        map-markers={mapMarkers}
        markers-title={markersTitle}
        center={center}>
   </lightning-map>
</template>
```

The markers and the center are set in JavaScript.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                Street: '1000 5th Ave',
                City: 'New York',
                State: 'NY',
            },

            title: 'Metropolitan Museum of Art',
            description:
                'A grand setting for one of the greatest collections of art, from ancient to contemporary.',
        },
        {
            location: {
                Street: '11 W 53rd St',
                City: 'New York',
                State: 'NY',
            },

            title: 'Museum of Modern Art (MoMA)',
            description:
                'Thought-provoking modern and contemporary art.',
        },
        {
            location: {
                Street: '1071 5th Ave',
                City: 'New York',
                State: 'NY',
            },

            title: 'Guggenheim Museum',
            description: 'World-renowned collection of modern and contemporary art.',
        },
    ];

        markersTitle = "Coordinates for Centering";

        center = {
            location: { Latitude: '40.7831856',
                        Longitude: '-73.9675653' }
};
}
```

The same map could use address elements to center:

```javascript
center = {
    location: { Street: '170 Central Park West',
                PostalCode: '10024' }
        };
```


#### Showing the Footer

The footer displays a link for opening the map in Google Maps in a new window or tab. By default, the first marker location opens. When viewing a map with multiple locations, select a location from the list before clicking the link to open that location in Google Maps.
The external Google map image shows a marker labeled with the location information that's specified for the marker in `lightning-map`. The title and description is not included.

To display the footer, specify the `show-footer` attribute.

```html
 <template>
     <lightning-map
        map-markers={mapMarkers}
        markers-title={markersTitle}
        show-footer>
     </lightning-map>
</template>
```

#### Usage Considerations

The `lightning-map` component relies on data from Google for geocoding and mapping imagery. Inaccuracies or geocoding errors in the data can't be fixed by Salesforce.

You can have up to 10 geocoded address lookups per map. Lookups for both the `map-markers` and `center` attributes count against this limit. To display more markers, provide position values that don't require geocoding, such as with a pair of latitude and longitude values. Locations that exceed the geocoding limit are ignored.

All latitude and longitude values must be valid. If you pass in an invalid latitude or longitude, the markers are not plotted on the map. Latitude values fall within -90 and 90, and longitude values fall within -180 and 180.

Additionally, consider the following:
* If you specify an address, you must provide at least one of the following values: City, PostalCode, State or Country.
* If you pass in both an address and a latitude and longitude, the map plots the marker according to the latitude and longitude values.
* If a marker in the `map-markers` array is invalid, no markers are plotted on the map.


