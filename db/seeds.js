var model = require('../models/text');

new model.Text({
  random: Math.random(),
  title: "Lorem ipsum",
  category: "lorem",
  text: "Lorem ipsum dolor sit amet dui a blandit sed, nunc. Etiam malesuada pretium. Vestibulum ullamcorper in, elementum eleifend."
}).save();

new model.Text({
  random: Math.random(),
  title: "Preasent",
  category: "lorem",
  text: "Praesent eu libero. Nulla interdum ligula libero, consectetuer adipiscing sed, ultrices consectetuer. Sed nibh sit amet eros. Quisque neque ut mi. Pellentesque."
}).save();

new model.Text({
  random: Math.random(),
  title: "Curae",
  category: "lorem",
  text: "Curae, In tristique senectus et malesuada fames ac viverra sem laoreet ut, dignissim nibh. Morbi."
}).save();

new model.Text({
  random: Math.random(),
  title: "Mauris ut pede",
  category: "lorem",
  text: "Mauris ut pede. Suspendisse ultricies nec, eros. In euismod orci interdum pellentesque vel, arcu. Sed placerat."
}).save();

new model.Text({
  random: Math.random(),
  title: "Pellentesque eu nunc",
  category: "lorem",
  text: "Pellentesque eu nunc. Maecenas ac arcu elementum nulla. Suspendisse luctus et lacus ipsum primis in faucibus justo."
}).save();

new model.Text({
  random: Math.random(),
  title: "Curabitur faucibus",
  category: "lorem",
  text: "Curabitur faucibus. Sed in interdum mi id enim. Suspendisse vitae justo. Nulla eu mi. Fusce ligula. Donec nec quam. Nullam justo elit, dictum arcu."
}).save();

new model.Text({
  random: Math.random(),
  title: "Class aptent",
  category: "lorem",
  text: "Class aptent taciti sociosqu ad litora torquent per inceptos hymenaeos. Sed dignissim volutpat at, pretium."
}).save();

new model.Text({
  random: Math.random(),
  title: "Morbi hendrerit",
  category: "lorem",
  text: "Morbi hendrerit. Sed sagittis eu, auctor sapien. Cras volutpat quam ipsum, ultricies in, adipiscing dictum a, tellus. In tristique senectus et malesuada fames ac."
}).save();
