class LeaderBinner{
    constructor(points, radius){
        this.points = points;
        this.radius = radius;
    }
    get leaders(){
        let self = this;
        let theLeaders = [];
        //find all the leaders
        this.points.forEach(point=>{
            let leader = closestLeader(theLeaders, point);
            if(!leader){
                let newLeader = [];
                newLeader.x = point[0];
                newLeader.y = point[1];
                theLeaders.push(newLeader);
            }
        });
        //now do this again to set the closest leader.
        this.points.forEach(point=>{
           let leader = closestLeader(theLeaders, point);
           leader.push(point);
        });
        return theLeaders;
        function closestLeader(leaders, point){
            let length = leaders.length;
            let minDistance = 2;//select 2 since normalized distance can't  be greater than 2.
            let theLeader = null;
            for (let i = 0; i < length; ++i) {
                let l = leaders[i];
                let d = distance([l.x, l.y], point);
                if(d< self.radius){
                    if(d<minDistance){
                        minDistance = d;
                        theLeader = l;
                    }
                }
            }
            return theLeader;
        }
    }
}