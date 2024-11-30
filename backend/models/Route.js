routeSchema.index({ 'startLocation.coordinates': '2dsphere' });
routeSchema.index({ 'endLocation.coordinates': '2dsphere' }); 