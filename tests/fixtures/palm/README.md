The local fixtures exercise the palm image gate and reading. The first reference is *Palm, fingers.jpg* by Genusfotografen (Tomas Gunnarsson) & Wikimedia Sverige, [source](https://commons.wikimedia.org/wiki/File:Palm,_fingers.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The resized JPEG and its blurred derivative are distributed under that same license.

The independent second reference, `second-open.jpg`, is the Wikimedia 960 px thumbnail of *Human Palm.jpg* by ESEMES, [source](https://commons.wikimedia.org/wiki/File:Human_Palm.jpg), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). It shows a different palm, with lower contrast and visible light reflections. Check descriptions against the actual photos as well as checking that the generated interpretations differ.

Before testing, visual inspection of the reference identified a single open palm, an arcing crease around the base of the thumb, and transverse creases below the finger bases and across the center. The blur removes the crease detail. The synthetic shapes image contains only a blue rectangle and an orange circle.

The negative dorsal photo is fetched at test time from [Google MediaPipe](https://storage.googleapis.com/mediapipe-assets/right_hands.jpg). It shows the backs of two hands, with visible nails.

The optional live check runs the same server module used by the reading handler. Run it only in the Israeli test environment with its existing server credential. Each image receives a visual inspection. Only accepted images receive an additional text-only call for interpretation. No user images or account details are required.
