# CS425 - Computer Graphics I (Spring 2021)

## Assignment 3: Ray tracing
The goal of this assignment is to implement a simple ray tracer using JavaScript. You will develop an application to ray trace a scene described in an external JSON (uploaded by the user through a configuration panel). The JSON file contains camera attributes (position, fov, direction), objects in the scene (spheres or planes), as well as the position of light sources.

#### I have symbol eg. R1, R2,.. to indicate on code, so you can find on code where the symbol to see technical code. 

### Trace  + intersectObject
 + Formally, trace give  rays out from screen consist of its origin and direction shoot out to reach object, trying to intersect the surface, 
 + intersectObject need determine what object the ray intersect closet. And here, we have raySphereIntersection and rayPlaneIntersection. We return closet variable as pair of the ray intersection point p(t) and object intersect. 


### raySphereIntersection + rayPlaneIntersection 
  + raySphereIntersection, after plug p=e+ t*d  into sphere equation  (p-c).(p-c) -R^2 = 0, we can solve t as the t distance of the ray in d direction to intersect surface of sphere, in quadratic form 
  + also t can return a distance negative, we need make sure -first there is solution discr = 0 or disr >0, then t should be greater than 0. With if( t1 <= 0 || t2 <= 0 ) on (R1). 
  + rayPlaneIntersection , has its own function to see intersection t= ((p - e).n )/  n.d (R2.1) . Also we need make sure t  > 0 (R2.2)
  + Both return to a ray with certain distance

### isInShadow + Blinn Phong 
   + we compute aggregate of specular and diffuse when hit intersection is not in shadow based on Blinn Phong s
   + diffuse is  =+ object.diffuseK *dot(l_dir,normal) (R3.1), such l_dir is light direction from light position to hit point 
   + specular is   += object.specularK * Math.pow(dot(h,normal),object.specularExponent);  here we need halfway vector and specularExponent of particular object
   + isInShadow, we want see intersectObjects() from hit point to light position if the ray is hit any object, if there exist intersection then, it’s in shadow. Otherwise, not in shadow
 
### Reflected + depth 
  + reflected() return a new reflected ray from normal on surface on (R4.1), then turn it into new Ray() with origin (R4.2), then we assume the new reflected ray just like ray shoot from screen on (R4.3)
  + As we shoot reflected ray out world again, so reflected could hit other objects or higher depth can reflect the secondary ray back to itself. Then, at some point we need stop reflection 
  + It will return color of the reflected ray hit to other object (new_color) and  object itself (color) . (R4.4) 
