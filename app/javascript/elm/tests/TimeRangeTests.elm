module TimeRangeTests exposing (all)

import Expect
import Fuzz exposing (int)
import Json.Encode as Encode
import Test exposing (..)
import Test.Html.Query as Query
import Test.Html.Selector as Slc
import TimeRange


all : Test
all =
    describe "TimeRange"
        [ test ".viewTimeFilter has an input field" <|
            \_ ->
                TimeRange.viewTimeFilter |> Query.fromHtml |> Query.has [ Slc.tag "input" ]
        , fuzz2 int int ".update returns updated TimeRange if value has correct format" <|
            \timeFrom timeTo ->
                let
                    value =
                        Encode.object [ ( "timeFrom", Encode.int timeFrom ), ( "timeTo", Encode.int timeTo ) ]

                    expected =
                        TimeRange.TimeRange
                            { timeFrom = timeFrom
                            , timeTo = timeTo
                            }
                in
                TimeRange.update TimeRange.defaultTimeRange value
                    |> Expect.equal expected
        , test ".update returns the same TimeRange if value has incorrect format" <|
            \_ ->
                let
                    value =
                        Encode.object [ ( "otherField", Encode.int 1 ) ]

                    expected =
                        TimeRange.defaultTimeRange
                in
                TimeRange.update TimeRange.defaultTimeRange value
                    |> Expect.equal expected
        ]