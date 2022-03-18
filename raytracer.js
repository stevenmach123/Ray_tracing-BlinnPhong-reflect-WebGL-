var scene = null;
var maxDepth = 1;
var background_color = [190/255, 210/255, 215/255];
var ambientToggle = true;
var diffuseToggle = true;
var specularToggle = true;
var reflectionToggle = true;
var bias = 0.001;
//0.00001;s
class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
}

class Intersection {
    constructor(distance, point) {
        this.distance = distance;
        this.point = point;
    }
}

class Hit {
    constructor(intersection, object) {
        this.intersection = intersection;
        this.object = object;
    }
}

/*
    Intersect objects
*/
function raySphereIntersection(ray, sphere) {
    var center = sphere.center;
    var radius = sphere.radius;

    // Compute intersection

    // If there is a intersection, return a new Intersection object with the distance and intersection point:
    // E.g., return new Intersection(t, point);

    // If no intersection, return null
    
  
    
    var L  = sub(ray.origin,center);  
    var a = dot(ray.direction,ray.direction) ;
    var b  = dot(ray.direction,L)*2;
    //var b = dot(mult(ray.direction, 2), sub(ray.origin, center));
    var c  = dot(L,L) - Math.pow(radius,2);
    var discr = b*b -4*a*c ; // compute discriminant 
   
    if(discr <0){  // no solutin
        return null;
    }
    else if (discr == 0){ // 1 solution
        var t = - 0.5 * b/a;
        var p =  add(ray.origin, mult(ray.direction,t) ) ;
        if(t<=0){
            return null;
        }
        //console.log(discr);
        p = sub(p, mult(ray.direction, bias));
        return new Intersection(t,p);
    }
    else if(discr > 0){
        var t1 = (-0.5 * (b+ Math.sqrt(discr)) ) /a ;
        var t2  = (-0.5 * (b-Math.sqrt(discr )) ) / a ;
        if(t1 <=0  || t2<= 0){ // t value is negative, since or is if 1 is positive, other is negative, then smallest is negative
            return null;    // (R1)
        }
        var p =null ;
        var t= null; 
        var p1 = add(ray.origin, mult(ray.direction,t1));
        var p2  =  add(ray.origin, mult(ray.direction,t2)); 
        if(p1 > p2){ // found closest point intersection 
            p = p2 ;
            t= t1
        }
        else{
            p = p1 ; 
            t= t2 ;
        }
        p = sub(p, mult(ray.direction, bias)); // adjust ray to closer the intersection 

        return new Intersection(t,p) ;
    }



}

function rayPlaneIntersection(ray, plane) {

    // Compute intersection

    // If there is a intersection, return a dictionary with the distance and intersection point:
    // E.g., return new Intersection(t, point);

    // If no intersection, return null

    var p = plane.center;
    var e = ray.origin;
    var n = normalize(plane.normal);
    var d = ray.direction;

    if ( dot(n, d) == 0){ // denominator is 0, no solution
        return null;
    }
    else {
    
        var t = dot(sub(p, e), n) / dot(n, d);  // (R2.1)
        if(t<=0){// numerator is 0 or smaller than 0   (R2.2)
            return null;   
        }
        
        var po = add(e, mult(d, t));
        po = sub(po, mult(ray.direction, bias));

        return new Intersection(t, po);
    }

}

function intersectObjects(ray, depth) {


    // Loop through all objects, compute their intersection (based on object type and calling the previous two functions)
    // Return a new Hit object, with the closest intersection and closest object

    // If no hit, retur null
   // console.log("inter_obj");
    var  closest = new Hit(new Intersection(Infinity,Infinity),null)
    for (var i = 0; i < scene.objects.length; i++) {
        var object = scene.objects[i];
        var current_inter = null; 
        
        if (object.type =="sphere"){
         
            current_inter = raySphereIntersection(ray,object);
        }
        else{
            
            current_inter  = rayPlaneIntersection(ray,object );
        }
        

        
        if (current_inter !== null && current_inter.distance < closest.intersection.distance   ) { // assign cloest when there a intersection, and cloeser than current assigned object 
            closest=  new Hit(current_inter,object);
        }
       
      }
      if(closest.object== null ){ // if intersect no object, return null
        return null; 
      }
      else{  

      return closest;
      }
    

}

function sphereNormal(sphere, pos) {
    // Return sphere normal
    
    var n = normalize(sub(pos,sphere.center) );
    return n;
}

/*
    Shade surface
*/
function shade(ray, hit, depth) {

    var object = hit.object;

    var color =[0,0,0];
    var normal = null;
    if( object.type =="sphere"){  //compute normal on hit point
        normal  =sphereNormal(object,hit.intersection.point);
    }
    else if(object.type =="plane"){
       normal = normalize(object.normal);
    
    }
    
    // Compute object normal, based on object type
    // If sphere, use sphereNormal, if not then it's a plane, use object normal
    //color = add(color,mult(object.color, object.ambientK));
 
    
    // Loop through all lights, computing diffuse and specular components *if not in shadow*
    var diffuse = 0;
    var specular = 0;

    //console.log("shade light",sub(ray.direction,object.center) );
   // console.log("shade light",mult(sub(ray.direction,object.center),2));
  

    var ambient_color  =  mult(object.color, object.ambientK); 
   //s console.log("hit",hit.intersection.point); 
    
    for( var i=0 ; i< scene.lights.length ;i++){ 
        var light = scene.lights[i] ;
       
        var l_dir = normalize(sub(light.position, hit.intersection.point )); // light direction 
       // console.log("light dir",l_dir);
        var h = normalize(add(l_dir,mult(ray.direction,-1))); // halfway vector
        
        if(!isInShadow(hit.intersection.point,light.position)){
         
            diffuse +=   object.diffuseK *dot(l_dir,normal)  ;   // aggregate difusse phin phong  (R3.1)
            specular    += object.specularK * Math.pow(dot(h,normal),object.specularExponent) ;// aggregate specular phin phong (R3.2)
        }
    }  

  var total = 0 ; 
  if(ambientToggle ==true){
      total  += object.ambientK; 
  }
  if(diffuseToggle ==true){
      total += diffuse;
   }
   if(specularToggle == true){
       total  += specular ;
   }

   color = add(color,mult(object.color,total));
  
  if(depth < maxDepth && reflectionToggle ==true){
    var reflect_dir   = reflected(mult(ray.direction,-1),normal); // found reflect direction on normal of hit point (R4.1)

    var reflect_ray =  new Ray(hit.intersection.point, reflect_dir); // give a reflected ray with origin (R4.2)
    var new_color  = trace(reflect_ray,depth+1); // recursive trace depth  (R4.3)
    if(new_color ==null){
        return color;
    } 
    else{
        return  add(color,mult(new_color,object.reflectiveK)) ; // aggremgate diffuse,specular,ambient of old color and reflect color through each deep. On different hit point (R4.4)
    }
 }

  
  
    // Combine colors, taking into account object constants

    // Handle reflection, make sure to call trace incrementing depth

    return color;
}


function isInShadow(hit, light) {

    // Check if there is an intersection between the hit.intersection.point point and the light
    // If so, return true
    // If not, return false

    var dir  = normalize(sub(light,hit)); // light direction 
    //dir = mult(dir,-1);
    var ray = new Ray(hit,dir);
    var inter = intersectObjects(ray,1);
    //console.log("hit todd light",inter.intersection.distance, inter.intersection.point);
    //&& inter.intersection.distance > 0 
    if(inter != null && inter.intersection.distance > 0  ){ // relfect intersection need make sure t > 0
        return true; 
    }
    else{ // if no intersection or t<= 0 
        return false; 
    }
}


/*
    Trace ray
*/
function trace(ray, depth) {
    if(depth > maxDepth) return background_color;
    var hit = intersectObjects(ray, depth);
    if(hit != null ) {
        var color = shade(ray, hit, depth);
        return color;
    }
    return null;
}



function reflected(ray,normal){ // compute reflection ray on normal 
    var d = mult(normal,dot(ray,normal));
    return normalize(sub(mult(d,2),ray)); 
    
}

/*
    Render loop
*/
function render(element) {
    if(scene == null)
        return;
    
    var width = element.clientWidth;
    var height = element.clientHeight;
    element.width = width;
    element.height = height;
    scene.camera.width = width;
    scene.camera.height = height;

    var ctx = element.getContext("2d");
    var data = ctx.getImageData(0, 0, width, height);

    var eye = normalize(sub(scene.camera.direction,scene.camera.position));
    var right = normalize(cross(eye, [0,1,0]));
    var up = normalize(cross(right, eye));
    var fov = ((scene.camera.fov / 2.0) * Math.PI / 180.0);

    var halfWidth = Math.tan(fov);
    var halfHeight = (scene.camera.height / scene.camera.width) * halfWidth;
    var pixelWidth = (halfWidth * 2) / (scene.camera.width - 1);
    var pixelHeight = (halfHeight * 2) / (scene.camera.height - 1);

    for(var x=0; x < width; x++) {
        for(var y=0; y < height; y++) {
            var vx = mult(right, x*pixelWidth - halfWidth);
            var vy = mult(up, y*pixelHeight - halfHeight);
            var direction = normalize(add(add(eye,vx),vy));
            var origin = scene.camera.position;

            var ray = new Ray(origin, direction);
            var color = trace(ray, 0);
            if(color != null) {
                var index = x * 4 + y * width * 4;
                data.data[index + 0] = color[0];
                data.data[index + 1] = color[1];
                data.data[index + 2] = color[2];
                data.data[index + 3] = 255;
            }
        }
    }
    ///console.log("done");
    ctx.putImageData(data, 0, 0);
}

/*
    Handlers
*/
window.handleFile = function(e) {
    var reader = new FileReader();
    reader.onload = function(evt) {
        var parsed = JSON.parse(evt.target.result);
        scene = parsed;
    }
    reader.readAsText(e.files[0]);
}

window.updateMaxDepth = function() {
    maxDepth = document.querySelector("#maxDepth").value;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleAmbient = function() {
    ambientToggle = document.querySelector("#ambient").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleDiffuse = function() {
    diffuseToggle = document.querySelector("#diffuse").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleSpecular = function() {
    specularToggle = document.querySelector("#specular").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleReflection = function() {
    reflectionToggle = document.querySelector("#reflection").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

/*
    Render scene
*/
window.renderScene = function(e) {
    var element = document.querySelector("#canvas");
    render(element);
}

console.log(Math.pow(4,2));
var aa = add([4,5,6],[2,0,5]);
console.log(aa);
