// CloudFront Function (viewer-request) for In Plain Sight.
// Private-S3 + CloudFront only auto-serves the default root object (index.html)
// for "/". Astro builds path-based tools as /trash/index.html, /rentals/index.html,
// etc. This appends index.html so extensionless "pretty" URLs resolve.
//
// Associate on the distribution's DEFAULT behavior -> Viewer request event.
function handler(event) {
  var req = event.request;
  var uri = req.uri;
  if (uri.endsWith('/')) { req.uri = uri + 'index.html'; }
  else if (!uri.includes('.')) { req.uri = uri + '/index.html'; }
  return req;
}
