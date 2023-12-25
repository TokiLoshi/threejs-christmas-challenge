# threejs-christmas-challenge

threejs-chirstmas-challenge is a 3D interactive gift stacking scene with a snowman and falling snow. This project was developed for the [three.js journey](https://threejs-journey.com/) Christmas Challenge, taught by [Bruno Simon](https://bruno-simon.com/) and was built with the [three.js](https://threejs.org/) and [cannon-es libraries](https://pmndrs.github.io/cannon-es/). Users can click on the controls to add presents or to clean up the scene. A sound plays each time the button is clicked.

![Preview](/static/readmePreview.png)

## Background

I am on chapter 21 of the Three.js journey course (importing models) and took the chance to participate in the community's monthly as an opportunity to practice some of the concepts we had covered in the course. The snow is created using particles following along with chapter 18. The snowman was my first blender model outside of the threejs course and while it could use a lot of work I really had fun making it. I followed [Grant Abbit's YouTube Tutorial](https://www.youtube.com/watch?v=Qjg6R0dA8ng).

I created the wrapping paper for the presents using patterns available in [Canva](https://www.canva.com/) and adding shapes to them to make it look like ribbons.

I followed the physics chapter (20), to stack presents.

I created the sounds using 'Raining Bells' in [Garage Band](https://www.apple.com/mac/garageband/).

## Challenges and areas I would like to improve

- Creating the Physics body for the snowman was a big challenge for me and I think there is still a bit too much room above the hat.
- Eliminating z fighting, which while I was able to improve slightly, presents do start z-fighting when there is a large pile accumulating.
- Continous snow falling - there are still parts when the snow gathers in a line before it resets, this could be improved upon.
- I was hoping to build the scene so that the presents would fall off of the plane, but was not able to resolve this in the time I had for this project. I do think this would have been a better effect.
