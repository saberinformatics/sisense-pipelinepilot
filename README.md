![saberinformatics logo](https://semanticplp.s3.amazonaws.com/saber-logo.png?AWSAccessKeyId=AKIAIHR7QYSU2SL7H7ZQ&Expires=1610505755&Signature=iLR6yyyhXK7kGDP6lo%2BTWZFWxgs%3D "Saber Informatics") http://saberinformatics.com

# A widget for [Sisense Prism](https://documentationv7.sisense.com/v5/elasticube-manager/introduction-to-elasticube-manager/) to run [Pipeline Pilot](http://accelrys.com/products/collaborative-science/biovia-pipeline-pilot) protocols and webservices.

Add fantastic data processing capabilities to [Sisense Prism](https://documentationv7.sisense.com/v5/elasticube-manager/introduction-to-elasticube-manager/) which already has a performance-tuned data repository and a powerful visualization UI. Connect [Pipeline Pilot](http://accelrys.com/products/collaborative-science/biovia-pipeline-pilot) protocols to [Sisense](https://documentationv7.sisense.com/v5/elasticube-manager/introduction-to-elasticube-manager) data queries as they are performed by users in Sisense Prism.

Add a modern, data-connected and amazingly powerful user interface to [Pipeline Pilot](http://accelrys.com/products/collaborative-science/biovia-pipeline-pilot) protocols and web applications. [Sisense Prism](https://documentationv7.sisense.com/v5/elasticube-manager/introduction-to-elasticube-manager/) is a fast reporting database that responds to complex queries in seconds.

The sisense-pipelinepilot widget is available to the community as open-source code under the MIT license. For those users who need additional assurance, commercial support is available directly from [Saber Informatics](https://saberinformatics.com). We are located in Massachusetts, US.

## Compatibility
Sisense Prism: v6, v7.
Pipeline Pilot Server: Pipeline Pilot v9.2 or later, including 2018. Windows or UNIX.

## Installation

The widget has been implemented as a plugin for Sisense Prism. Download the `pipelinepilot` folder into your C:\Program Files\Sisense\PrismWeb\plugins\ folder. If the plugins folder doesn’t exist, just create it. Within a few seconds Sisense will scan and load the plugin. You can then manage it in the [admin interface](https://documentation.sisense.com/managing-plug-ins/).

There is no need to restart Sisense Prism. 

See the note below on enabling cross-origin resource sharing between the two servers ([CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)).

## Note on [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
Cross-origin resource sharing is a mechanism for web applications to pull interactive content from multiple servers, in this case Prism and Pipeline Pilot. It's a very simple setting on a Pipeline Pilot server (no need to set anything in Sisense Prism). -------- description to be added ------------------------------------------

## Usage
In a dashboard add a new widget (Pipeline Pilot), select one or more data columns for it to read from the elasticube, and set a Pipeline Pilot protocol URL to run. -------- description to be added ------------------------------------------
