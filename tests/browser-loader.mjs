export function resolve(specifier,context,next){if(specifier.startsWith('/shared/'))return next(new URL('../shared/'+specifier.slice(8),import.meta.url).href,context);return next(specifier,context);}
