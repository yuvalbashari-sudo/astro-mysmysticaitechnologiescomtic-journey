The three local fixtures exercise the palm image gate. The reference is *Palm, fingers.jpg* by Genusfotografen (Tomas Gunnarsson) & Wikimedia Sverige, [source](https://commons.wikimedia.org/wiki/File:Palm,_fingers.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The resized JPEG and its blurred derivative are distributed under that same license.

Before testing, visual inspection of the reference identified a single open palm, an arcing crease around the base of the thumb, and transverse creases below the finger bases and across the center. The blur removes the crease detail. The synthetic shapes image contains only a blue rectangle and an orange circle.

The negative dorsal photo is fetched at test time from [Google MediaPipe](https://storage.googleapis.com/mediapipe-assets/right_hands.jpg). It shows the backs of two hands, with visible nails.

The optional live check runs the same server module used by the reading handler. Run it only in the Israeli test environment with its existing server credential. It uses one model inspection for each of the four images. No user images or account details are required.
