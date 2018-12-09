


class Jello {
  // Cached variables that can be used and changed in all the functions in the class
  constructor(options = {}) {
    this.defaults = {};
    this.options = options;
    this.canvasHolder = document.getElementById("jello-container");
    this.imgWidth = 1000;
    this.imgHeight = 500;
    this.imgRatio = this.imgHeight / this.imgWidth;
    this.winWidth = window.innerWidth;
    this.bgArray = [];
    this.bgSpriteArray = [];
    this.renderer = PIXI.autoDetectRenderer(
      this.winWidth,
      this.winWidth * this.imgRatio
    );
    this.stage = new PIXI.Container();
    this.imgContainer = new PIXI.Container();
    this.imageCounter = 0;
    this.displacementSprite = PIXI.Sprite.fromImage(
      "https://upload.wikimedia.org/wikipedia/commons/8/89/Cyclone_Catarina_from_the_ISS_on_March_26_2004.JPG"
    );
    this.displacementFilter = new PIXI.filters.DisplacementFilter(
      this.displacementSprite
    );
    this.currentMap = {};
    this.mapCounter = 0;
    this.mapArray = [];
    this.raf = this.animateFilters.bind(this);

    this.isDistorted = true;
    this.isTransitioning = false;

    this.initialize();
  }

  initialize() {
    this.defaults = {
      transition: 1,
      speed: 2,
      dispScale: 50,
      dispX: true,
      dispY: true,
      count: 0
    };

    this.update();

    // An array of images for background (.jpg)
    // They'll transition in the order listed below
    this.bgArray.push(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Barren_ridge_%283973968170%29.jpg/1920px-Barren_ridge_%283973968170%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Camel_Trail_%284176162683%29.jpg/1280px-Camel_Trail_%284176162683%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Chuquicamata_copper_mine_-_panoramio.jpg/1280px-Chuquicamata_copper_mine_-_panoramio.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Desert_%286486329823%29.jpg/1280px-Desert_%286486329823%29.jpg",
    );

    // An array of displacement maps
    // They'll transition in the order below with the included settings
    this.mapArray.push(
      {
        image:
          "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1043/dmap-clouds-01.jpg",
        speed: 0.5,
        scale: 200
      },
      {
        image:
          "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1043/dmap-glass-01.jpg",
        speed: 0.3,
        scale: 200
      }
    );

    this.backgroundFill();
    this.buildStage();
    this.createBackgrounds();
    this.createFilters();
    this.animateFilters();
    this.eventListener();

    this.renderer.view.setAttribute("class", "jello-canvas");
    this.canvasHolder.appendChild(this.renderer.view);
  }

  // define animations and call this.raf
  animateFilters() {
    this.displacementFilter.scale.x = this.settings.dispX
      ? this.settings.transition * this.settings.dispScale
      : 0;
    this.displacementFilter.scale.y = this.settings.dispY
      ? this.settings.transition * (this.settings.dispScale + 10)
      : 0;

    this.displacementSprite.x = Math.sin(this.settings.count * 0.15) * 200;
    this.displacementSprite.y = Math.cos(this.settings.count * 0.13) * 200;

    this.displacementSprite.rotation = this.settings.count * 0.06;

    this.settings.count += 0.05 * this.settings.speed;
    //pixi.autodetectrenderer().renderer.render
    this.renderer.render(this.stage);

    window.requestAnimationFrame(this.raf);
  }

  // canvas built to fill width of window
  backgroundFill() {
    // this.renderer.view.setAttribute('style', 'height:auto;width:100%;');
  }

  // main container for animation
  buildStage() {
    this.imgContainer.position.x = this.imgWidth / 2;
    this.imgContainer.position.y = this.imgHeight / 2;

    this.stage.scale.x = this.stage.scale.y = this.winWidth / this.imgWidth;
    this.stage.interactive = true;
    this.stage.addChild(this.imgContainer);
  }

  // cycle through this.bgArray and change images with crossfade
  changeImage() {
    if (this.imageCounter < this.bgArray.length - 1) {
      this.imageCounter++;
    } else {
      this.imageCounter = 0;
    }

    this.bgSpriteArray.map((sprite, i) => {
      if (i == this.imageCounter) {
        TweenLite.to(sprite, 1, { alpha: 1, ease: Power2.easeInOut });
      } else {
        TweenLite.to(sprite, 1, { alpha: 0, ease: Power2.easeInOut });
      }
    });
  }
  setImage(x) {
     this.imageCounter = x;
        this.bgSpriteArray.map((sprite, i) => {
      if (i == this.imageCounter) {
        TweenLite.to(sprite, 1, { alpha: 1, ease: Power2.easeInOut });
      } else {
        TweenLite.to(sprite, 1, { alpha: 0, ease: Power2.easeInOut });
      }
    });
  }

  // cycle through this.mapArray and change displacement maps
  changeMap() {
    if (this.mapCounter < this.mapArray.length - 1) {
      this.mapCounter++;
    } else {
      this.mapCounter = 0;
    }

    this.currentMap = this.mapArray[this.mapCounter];
    this.displacementSprite = PIXI.Sprite.fromImage(`${this.currentMap.image}`);
    this.displacementFilter = new PIXI.filters.DisplacementFilter(
      this.displacementSprite
    );
    this.createFilters();
  }

  // preload all backgrounds for quick transitions
  createBackgrounds() {
    this.bgArray.map(image => {
      const bg = PIXI.Sprite.fromImage(image);

      // Set image anchor to the center of the image
      bg.anchor.x = 0.5;
      bg.anchor.y = 0.5;

      this.imgContainer.addChild(bg);
      this.bgSpriteArray.push(bg);

      // set first image alpha to 1, all else to 0
      bg.alpha = this.bgSpriteArray.length === 1 ? 1 : 0;
    });
  }

  // distortion filters added to stage
  createFilters() {
    this.stage.addChild(this.displacementSprite);

    this.displacementFilter.scale.x = this.displacementFilter.scale.y =
      this.winWidth / this.imgWidth;

    this.imgContainer.filters = [this.displacementFilter];
  }

  // function changes the distortion level to a specific amount
  distortionLevel(amt) {
    if (!this.isTransitioning) {
      this.isTransitioning = false;
      TweenLite.to(this.settings, 1, {
        transition: amt,
        speed: this.currentMap.speed,
        dispScale: this.currentMap.scale,
        ease: Power2.easeInOut,
        onComplete: () => {
          this.isTransitioning = false;
        }
      });
    }
  }



  // click events
  eventListener() {
    const changeImageBtn = document.getElementsByClassName(
      "js-change-image"
    )[0];
        const imageTo1 = document.getElementsByClassName(
      "js-change-image-1"
    )[0];
            const imageTo2 = document.getElementsByClassName(
      "js-change-image-2"
    )[0];
            const imageTo3 = document.getElementsByClassName(
      "js-change-image-3"
    )[0];
            const imageTo4 = document.getElementsByClassName(
      "js-change-image-4"
    )[0];
    const changeDistortionBtn = document.getElementsByClassName(
      "js-change-distortion"
    )[0];
    const toggleDistorionBtn = document.getElementsByClassName(
      "js-toggle-distortion"
    )[0];

     imageTo1.onclick = () => {
      this.setImage(0);
    };
         imageTo2.onclick = () => {
      this.setImage(1);
    };
         imageTo3.onclick = () => {
      this.setImage(2);
    };
         imageTo4.onclick = () => {
      this.setImage(3);
    };
    changeImageBtn.onclick = () => {
      this.changeImage();
    };

    toggleDistorionBtn.onclick = () => {
      this.toggleDistortion();
    };

    changeDistortionBtn.onclick = () => {
      this.changeDistortion();
    };
  }

  // turn the distortion on and off using the options.transistion variable
  toggleDistortion() {
    if (this.isDistorted) {
      this.distortionLevel(0);
      this.isDistorted = false;
    } else {
      this.distortionLevel(1);
      this.isDistorted = true;
    }
  }

  // Object.assign overwrites defaults with options to create settings
  update() {
    this.settings = Object.assign({}, this.defaults, this.options);
  }

  // ============ TEAR DOWN =============== //

  tearDown() {
    cancelAnimationFrame(this.raf);
    this.settings = {};
    this.bgArray = [];
    this.bgSpriteArray = [];
  }
}

const instance = new Jello();


$("#portal-a").hover(function() {
  $(".js-change-image-1").trigger("click");
});

$("#portal-b").hover(function() {
  $(".js-change-image-2").trigger("click");
});

$("#portal-c").hover(function() {
  $(".js-change-image-3").trigger("click");
});

$("#portal-d").hover(function() {
  $(".js-change-image-4").trigger("click");
});

$(".js-toggle-distortion").trigger("click");

$("#top-panel-left").hover(function() {
  $(".js-change-distortion").trigger("click");
  $(".js-toggle-distortion").trigger("click");
});

$("#top-panel-center").hover(function() {
  $(".js-toggle-distortion").trigger("click");
});

$("#top-panel-right").hover(function() {
  $(".js-toggle-distortion").trigger("click");
});

$("#bottom-panel-right").hover(function() {
  $(".js-toggle-distortion").trigger("click");
});

$("#bottom-panel-left").hover(function() {
  $(".js-toggle-distortion").trigger("click");
});





window.onresize = function() {
  $(".portals div").each(function(index) {
    var w = $(this).width();
    var h = $(this).height();
    $(this).css(
      "background-size", w +"px " + h + "px");
  });
};


//On-click for portal-a changes backdrop to image A (amallal)
function changeImgA() {
    document.getElementById('backdrop').src = '../images/backdrops/amallal.jpg';
}

//On-click for portal-b changes backdrop to image B (baratikva)
function changeImgB() {
    document.getElementById('backdrop').src = '../images/backdrops/baratikva.jpg';
}

//On-click for portal-c changes backdrop to image C (mirador)
function changeImgC() {
    document.getElementById('backdrop').src = '../images/backdrops/mirador.jpg';
}

//On-click for portal-d changes backdrop to image D (north-tibet)
function changeImgD() {
    document.getElementById('backdrop').src = '../images/backdrops/north-tibet.jpg';
}
