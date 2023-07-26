To use the custom `lrctl` script for this version, run the following commands:

``` bash
docker images | grep oc-admin
curl -L https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v1.2/sandpit/lrctl -o lrctl-preview
chmod +x lrctl-preview
./lrctl-preview oc-admin restart
docker images | grep oc-admin
```
